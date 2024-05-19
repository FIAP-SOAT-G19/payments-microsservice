export type ProcessPaymentOutput = {
  status: string
  reason?: string
}

export interface ProcessPaymentUseCaseInterface {
  execute: (orderNumber: string) => Promise<void>
}
