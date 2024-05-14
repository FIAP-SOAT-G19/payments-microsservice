export type BuildPaymentInput = {
  id?: string
  orderNumber: string
  totalValue: number
  createdAt?: Date
  clientId?: string
  status?: string
  clientDocument?: string
  reason?: string
}
