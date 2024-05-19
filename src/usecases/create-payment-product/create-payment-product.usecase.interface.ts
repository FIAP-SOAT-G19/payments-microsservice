export type CreatePaymentProductInput = {
  paymentId: string
  name: string
  category: string
  description?: string
  price: number
  amount: number
  image?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreatePaymentProductUseCaseInterface {
  execute: (input: CreatePaymentProductInput) => Promise<void>
}
