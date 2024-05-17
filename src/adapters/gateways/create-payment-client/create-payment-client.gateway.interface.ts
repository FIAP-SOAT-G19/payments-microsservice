import { PaymentEntity } from '@/entities/payment/payment.entity'

export type CreatePaymentClientGatewayInput = {
  id: string
  paymentId: string
  identifier: string
  name: string
  cpf: string
  email: string
  createdAt: Date
  updatedAt: Date
}

export interface CreatePaymentClientGatewayInterface {
  createPaymentClient: (input: CreatePaymentClientGatewayInput) => Promise<void>
  getPaymentById: (paymentId: string) => Promise<PaymentEntity | null>
}
