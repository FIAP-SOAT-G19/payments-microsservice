export type ReversalPaymentOutput = {
  status: string
  totalValue: number
}

export interface ReversalPaymentUseCaseInterface {
  execute: (orderNumber: string) => Promise<void>
}
