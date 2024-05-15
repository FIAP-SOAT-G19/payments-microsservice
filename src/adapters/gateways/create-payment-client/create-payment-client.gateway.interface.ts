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
  getPaymentById: (id: string) => Promise<PaymentEntity | null>
  createPaymentClient: (input: CreatePaymentClientGatewayInput) => Promise<void>
}
