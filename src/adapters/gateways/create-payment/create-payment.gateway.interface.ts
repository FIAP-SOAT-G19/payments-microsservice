export type CreatePaymentGatewayInput = {
  id: string
  orderNumber: string
  totalValue: number
  cardId: string
  status: string
  createdAt: Date
  reason?: string
}

export interface CreatePaymenteGatewayInterface {
  createPayment: (input: CreatePaymentGatewayInput) => Promise<string>
}
