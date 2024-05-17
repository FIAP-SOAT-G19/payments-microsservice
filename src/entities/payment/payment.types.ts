export type BuildPaymentInput = {
  id?: string
  orderNumber: string
  totalValue: number
  createdAt?: Date
  status?: string
  reason?: string
}
