export type BuildPaymentInput = {
  id?: string
  orderNumber: string
  totalValue: number
  createdAt?: Date
  clientId?: string
  status?: string
  clientDocument?: string
  reason?: string
  products: PaymentProduct []
}

export type PaymentProduct = {
  id: string
  name: string
  category: string
  price: number
  description: string
  image: string
  createdAt: Date
  updatedAt?: Date
}
