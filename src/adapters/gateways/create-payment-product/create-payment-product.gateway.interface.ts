import { PaymentEntity } from '@/entities/payment/payment.entity'

export type CreatePaymentGatewayInput = {
  id: string
  paymentId: string
  name: string
  category: string
  description?: string
  price: number
  image?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreatePaymentProductGatewayInterface {
  createPaymentProduct: (input: CreatePaymentGatewayInput) => Promise<void>
  getPaymentById: (paymentId: string) => Promise<PaymentEntity | null>
}
