export type CreatePaymentInput = {
  id?: string
  orderNumber: string
  totalValue: number
  status: string
  createdAt?: Date
  clientId?: string
  clientDocument?: string
  reason?: string
}

export interface CreatePaymentUseCaseInterface {
  execute: (input: CreatePaymentInput) => Promise<string>
}
