import { isValidString } from '@/shared/helpers/string.helper'
import { CreatePaymentClientInput, CreatePaymentClientUseCaseInterface } from './create-payment-client.usecase.interface'
import { InvalidParamError, MissingParamError } from '@/shared/errors'
import { CreatePaymentClientGatewayInterface } from '@/adapters/gateways/create-payment-client/create-payment-client.gateway.interface'
import { CrypotInterface } from '@/adapters/tools/crypto/crypto.adapter.interface'
import { PaymentEntity } from '@/entities/payment/payment.entity'
import { logger } from '@/shared/helpers/logger.helper'
import constants from '@/shared/constants'
import { ProcessPaymentGatewayInterface } from '@/adapters/gateways/process-payment/process-payment.gateway.interface'

export class CreatePaymentClientUseCase implements CreatePaymentClientUseCaseInterface {
  constructor(
    private readonly paymentClientGateway: CreatePaymentClientGatewayInterface,
    private readonly crypto: CrypotInterface,
    private readonly processPaymentGateway: ProcessPaymentGatewayInterface
  ) {}

  async execute (input: CreatePaymentClientInput): Promise<void> {
    const payment = await this.validate(input)
    try {
      await this.paymentClientGateway.createPaymentClient({ id: this.crypto.generateUUID(), ...input })
    } catch (error) {
      await this.settingPaymentAsRefused(payment.id)
      await this.deletingPaymentProduct(payment.id)
      await this.handleError(payment.orderNumber)
      throw new Error('Error creating payment client - order was canceled')
    }
  }

  async validate (input: CreatePaymentClientInput): Promise<PaymentEntity> {
    const requiredFields: Array<keyof Omit<CreatePaymentClientInput, 'createdAt' | 'updatedAt'>> = ['paymentId', 'identifier', 'name', 'cpf', 'email']

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

    const paymentExists = await this.paymentClientGateway.getPaymentById(input.paymentId)

    if (!paymentExists) {
      throw new InvalidParamError('paymentId')
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

  async deletingPaymentProduct (paymentId: string): Promise<void> {
    logger.info('Error creating payment product, deleting payment products')
    await this.processPaymentGateway.deletePaymentProductById(paymentId)
  }
}
