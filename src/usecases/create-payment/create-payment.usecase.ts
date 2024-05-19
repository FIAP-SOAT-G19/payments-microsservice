import { PaymentEntity } from '@/entities/payment/payment.entity'
import { CreatePaymentInput, CreatePaymentUseCaseInterface } from './create-payment.usecase.interface'
import { CreatePaymenteGatewayInterface } from '@/adapters/gateways/create-payment/create-payment.gateway.interface'

export class CreatePaymentUseCase implements CreatePaymentUseCaseInterface {
  constructor(private readonly gateway: CreatePaymenteGatewayInterface) {}
  async execute (input: CreatePaymentInput): Promise<string> {
    const payment = PaymentEntity.build({
      orderNumber: input.orderNumber,
      totalValue: input.totalValue,
      cardId: input.cardId
    })

    await this.gateway.createPayment(payment)
    return payment.id
  }
}
