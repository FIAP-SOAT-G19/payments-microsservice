export type CreatePaymentInput = {
  id?: string
  orderNumber: string
  totalValue: number
  cardId: string
  status: string
  createdAt?: Date
  reason?: string
}

export interface CreatePaymentUseCaseInterface {
  execute: (input: CreatePaymentInput) => Promise<string>
}
