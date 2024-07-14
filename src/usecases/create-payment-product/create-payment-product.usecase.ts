import { isValidString } from '@/shared/helpers/string.helper'
import { CreatePaymentProductInput, CreatePaymentProductUseCaseInterface } from './create-payment-product.usecase.interface'
import { InvalidParamError, MissingParamError, PaymentNotFoundError } from '@/shared/errors'
import { CreatePaymentProductGatewayInterface } from '@/adapters/gateways/create-payment-product/create-payment-product.gateway.interface'
import { CrypotInterface } from '@/adapters/tools/crypto/crypto.adapter.interface'
import { logger } from '@/shared/helpers/logger.helper'
import constants from '@/shared/constants'
import { ProcessPaymentGatewayInterface } from '@/adapters/gateways/process-payment/process-payment.gateway.interface'
import { PaymentEntity } from '@/entities/payment/payment.entity'

export class CreatePaymentProductUseCase implements CreatePaymentProductUseCaseInterface {
  constructor(
    private readonly paymentProductGateway: CreatePaymentProductGatewayInterface,
    private readonly crypto: CrypotInterface,
    private readonly processPaymentGateway: ProcessPaymentGatewayInterface
  ) {}

  async execute (input: CreatePaymentProductInput): Promise<void> {
    const payment = await this.validate(input)
    try {
      await this.paymentProductGateway.createPaymentProduct({
        id: this.crypto.generateUUID(),
        ...input
      })
    } catch (error) {
      await this.settingPaymentAsRefused(payment.id)
      await this.handleError(payment.orderNumber)
      throw new Error('Error creating payment products - order was canceled')
    }
  }

  async validate (input: CreatePaymentProductInput): Promise<PaymentEntity> {
    const requiredFields: Array<keyof Omit<CreatePaymentProductInput, 'description' | 'createdAt' | 'updatedAt' | 'image' | 'price' | 'amount'>> = ['paymentId', 'name', 'category']

    requiredFields.forEach(field => {
      if (!isValidString(input[field])) {
        throw new MissingParamError(field)
      }
    })

    if (!input.createdAt) {
      throw new MissingParamError('createdAt')
    }

    if (!input.updatedAt) {
      throw new MissingParamError('updatedAt')
    }

    if (!input.price || input.price < 0) {
      throw new InvalidParamError('price')
    }

    const paymentExists = await this.paymentProductGateway.getPaymentById(input.paymentId)
    if (!paymentExists) {
      throw new PaymentNotFoundError()
    }
    return paymentExists
  }

  async handleError (orderNumber: string): Promise<void> {
    const messageDeduplicationId = orderNumber
    const messageGroupId = constants.MESSAGE_GROUP_ID
    const queueName = process.env.QUEUE_UPDATE_ORDER_FIFO!
    const message = JSON.stringify({ status: 'canceled', orderNumber })

    const success = await this.processPaymentGateway.sendMessageQueue(queueName, message, messageGroupId, messageDeduplicationId)
    logger.info(`Publishing message on queue\nQueueName: ${queueName}\nMessage: ${message}`)
    if (!success) {
      throw new Error('Error sending message queue')
    }
  }

  async settingPaymentAsRefused (paymentId: string): Promise<void> {
    logger.info(`Error creating payment, updating payment ${paymentId} to refused`)
    await this.processPaymentGateway.updatePaymentStatus(paymentId, constants.PAYMENT_STATUS.REFUSED)
  }
}
