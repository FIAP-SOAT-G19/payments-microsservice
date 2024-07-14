import { PaymentEntity } from '../../entities/payment/payment.entity'
import { CreatePaymentInput, CreatePaymentUseCaseInterface } from './create-payment.usecase.interface'
import { CreatePaymenteGatewayInterface } from '../../adapters/gateways/create-payment/create-payment.gateway.interface'
import { ProcessPaymentGatewayInterface } from '@/adapters/gateways/process-payment/process-payment.gateway.interface'
import { logger } from '@/shared/helpers/logger.helper'
import constants from '@/shared/constants'

export class CreatePaymentUseCase implements CreatePaymentUseCaseInterface {
  constructor(
    private readonly paymentGateway: CreatePaymenteGatewayInterface,
    private readonly processPaymentGateway: ProcessPaymentGatewayInterface
  ) {}

  async execute (input: CreatePaymentInput): Promise<string> {
    const payment = PaymentEntity.build({
      orderNumber: input.orderNumber,
      totalValue: input.totalValue,
      cardId: input.cardId
    })

    const paymentId = await this.paymentGateway.createPayment(payment)
    if (!paymentId) {
      await this.handleError(payment.orderNumber)
      throw new Error('Error creating payment - order was canceled')
    }
    return paymentId
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
}
