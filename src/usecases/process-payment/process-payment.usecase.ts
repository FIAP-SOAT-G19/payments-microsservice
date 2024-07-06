import { CreditCard, PaymentOutput, ProcessPaymentGatewayInterface } from '@/adapters/gateways/process-payment/process-payment.gateway.interface'
import { CrypotInterface } from '@/adapters/tools/crypto/crypto.adapter.interface'
import constants from '@/shared/constants'
import { logger } from '@/shared/helpers/logger.helper'
import { ProcessPaymentOutput, ProcessPaymentUseCaseInterface } from './process-payment.usecase.interface'
import { CardDecryptionError } from '@/shared/errors'

export class ProcessPaymentUseCase implements ProcessPaymentUseCaseInterface {
  constructor(
    private readonly gateway: ProcessPaymentGatewayInterface,
    private readonly crypto: CrypotInterface
  ) {}

  async execute (): Promise<void> {
    const payments = await this.gateway.getPaymentByStatus(constants.PAYMENT_STATUS.WAITING)

    if (!payments || payments.length === 0) {
      return
    }

    for await (const payment of payments) {
      await this.gateway.updatePaymentStatus(payment.payment.id, constants.PAYMENT_STATUS.PROCESSING)

      try {
        const creditCard = await this.handleCard(payment.payment.cardId)
        const response = await this.gateway.processExternalPayment(creditCard, payment.payment.totalValue)
        await this.handleResponse(response, payment)
      } catch (error) {
        if (error instanceof CardDecryptionError) {
          await this.handleResponse({ status: 'refused' }, payment)
        }
        throw error
      }
    }
  }

  async handleCard (cardId: string): Promise<CreditCard> {
    logger.info(`Send request to card_encryptor microsservice\n cardId: ${cardId} [GET]`)

    let cardEncrypted = null

    try {
      cardEncrypted = await this.gateway.getCardData(cardId)
    } catch (error) {
      logger.error(`Error get cardData\n ${error}`)
      throw new CardDecryptionError()
    }

    let cardDecrypted = null

    try {
      cardDecrypted = this.crypto.decrypt(cardEncrypted)
    } catch (error) {
      logger.error(`Error when decrypt cardData\n ${error}`)
      throw new CardDecryptionError()
    }

    if (!cardDecrypted) {
      logger.error('Error when decrypt cardData')
      throw new CardDecryptionError()
    }

    return cardDecrypted
  }

  async handleResponse (response: ProcessPaymentOutput, payment: PaymentOutput): Promise<void> {
    const { status, reason } = response
    const { orderNumber, totalValue, cardId: cardIdentifier, id, cardId } = payment.payment
    const messageDeduplicationId = orderNumber
    const messageGroupId = constants.MESSAGE_GROUP_ID

    let queueName = ''
    let message = ''

    if (status === constants.PAYMENT_STATUS.APPROVED) {
      queueName = process.env.QUEUE_APPROVED_PAYMENT!
      message = JSON.stringify({
        orderNumber,
        totalValue,
        cardIdentifier,
        products: payment.products,
        client: payment.client ?? undefined
      })
    } else {
      queueName = process.env.QUEUE_UNAUTHORIZED_PAYMENT!
      message = JSON.stringify({ status: 'canceled', reason, orderNumber })
    }

    const success = await this.gateway.sendMessageQueue(queueName, message, messageGroupId, messageDeduplicationId)
    logger.info(`Publishing message on queue\nQueueName: ${queueName}\nMessage: ${message}`)

    if (!success) {
      throw new Error('Error sending message queue')
    }

    await this.gateway.createPublishedMessageLog({
      id: this.crypto.generateUUID(),
      queue: queueName,
      message,
      origin: 'ProcessPaymentUseCase',
      createdAt: new Date()
    })

    await this.gateway.updatePaymentStatus(id, status)

    try {
      logger.info(`Send request to card_encryptor microsservice\n cardId: ${cardId} [DELETE]`)
      await this.gateway.deleteCardData(cardId)
    } catch (error) {
      logger.error(`Error delete cardData\n ${error}`)
      throw error
    }
  }

  getRandomCreditCard(): CreditCard {
    const cards = [
      {
        brand: 'master',
        number: '5170578203887556',
        cvv: '123',
        expiryMonth: '05',
        expiryYear: '2025'
      },
      {
        brand: 'visa',
        number: '4716059500917722',
        cvv: '321',
        expiryMonth: '12',
        expiryYear: '2026'
      },
      {
        brand: 'elo',
        number: '4716059500917723',
        cvv: '321',
        expiryMonth: '12',
        expiryYear: '2030'
      },
      {
        brand: 'visa',
        number: '4716059500917728',
        cvv: '321',
        expiryMonth: '11',
        expiryYear: '2050'
      }
    ]

    const randomIndex = Math.floor(Math.random() * cards.length)

    return cards[randomIndex]
  }
}
