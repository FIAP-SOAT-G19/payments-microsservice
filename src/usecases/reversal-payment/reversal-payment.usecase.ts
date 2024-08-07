import { CreditCard, PaymentModel, ProcessPaymentGatewayInterface } from '@/adapters/gateways/process-payment/process-payment.gateway.interface'
import { CrypotInterface } from '@/adapters/tools/crypto/crypto.adapter.interface'
import { logger } from '@/shared/helpers/logger.helper'
import { ReversalPaymentUseCaseInterface } from './reversal-payment.usecase.interface'
import { CardDecryptionError } from '@/shared/errors'
import { ProcessPaymentOutput } from '../process-payment/process-payment.usecase.interface'

export class ReversalPaymentUseCase implements ReversalPaymentUseCaseInterface {
  constructor(
    private readonly gateway: ProcessPaymentGatewayInterface,
    private readonly crypto: CrypotInterface
  ) {}

  async execute (orderNumber: string): Promise<void> {
    const payment = await this.gateway.getPaymentByOrderNumber(orderNumber)

    if (!payment) {
      return
    }

    const creditCard = await this.handleCard(payment.cardId)
    const response = await this.gateway.processExternalReversalPayment(creditCard, payment.totalValue)
    logger.info(`Request for refund was made`)
    await this.handleResponse(response, payment)
  }

  async handleCard (cardId: string): Promise<CreditCard> {
    logger.info(`Send request to card_encryptor microsservice\n cardId: ${cardId} [GET]`)
    const cardDecrypted = this.getRandomCreditCard()
    return cardDecrypted
  }

  async handleResponse (response: ProcessPaymentOutput, payment: PaymentModel): Promise<void> {
    const { status } = response
    const { id } = payment

    await this.gateway.updatePaymentStatus(id, status)
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
