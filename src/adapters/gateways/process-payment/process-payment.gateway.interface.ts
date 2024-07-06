import { ProcessPaymentOutput } from '@/usecases/process-payment/process-payment.usecase.interface'

export type PaymentOutput = {
  payment: PaymentModel
  client?: ClientModel
  products: ProductModel []
}

export type PaymentModel = {
  id: string
  orderNumber: string
  totalValue: number
  status: string
  reason: string
  cardId: string
}

export type ClientModel = {
  id: string
  identifier: string
  name: string
  cpf: string
  email: string
}

export type ProductModel = {
  name: string
  category: string
  description: string
  price: number
  amount: number
}

export type CreditCard = {
  brand: string
  number: string
  cvv: string
  expiryMonth: string
  expiryYear: string
}

export type CreatePublishedMessageLog = {
  id: string
  queue: string
  origin: string
  message: string
  createdAt: Date
}

export interface ProcessPaymentGatewayInterface {
  getPaymentByStatus: (status: string) => Promise<PaymentOutput [] | null>
  updatePaymentStatus: (id: string, status: string) => Promise<void>
  getCardData: (cardId: string) => Promise<string>
  deleteCardData: (cardId: string) => Promise<void>
  processExternalPayment: (creditCard: CreditCard, totalValue: number) => Promise<ProcessPaymentOutput>
  sendMessageQueue: (queueName: string, body: string, messageGroupId: string, messageDeduplicationId: string) => Promise<boolean>
  createPublishedMessageLog: (input: CreatePublishedMessageLog) => Promise<void>
  deletePaymentProductById: (paymentId: string) => Promise<void>
}
