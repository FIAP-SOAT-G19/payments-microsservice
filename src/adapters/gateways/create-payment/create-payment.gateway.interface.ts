export type CreatePaymentGatewayInput = {
  id: string
  orderNumber: string
  totalValue: number
  status: string
  createdAt: Date
  clientId?: string
  clientDocument?: string
  reason?: string
}

export interface CreatePaymenteGatewayInterface {
  createPayment: (input: CreatePaymentGatewayInput) => Promise<string>
}
