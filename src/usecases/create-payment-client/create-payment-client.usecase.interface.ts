export type CreatePaymentClientInput = {
  paymentId: string
  identifier: string
  name: string
  cpf: string
  email: string
  createdAt: Date
  updatedAt: Date
}

export interface CreatePaymentClientUseCaseInterface {
  execute: (input: CreatePaymentClientInput) => Promise<void>
}
