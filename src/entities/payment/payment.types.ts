export type BuildPaymentInput = {
  id?: string
  orderNumber: string
  cardId: string
  totalValue: number
  createdAt?: Date
  status?: string
  reason?: string
}
