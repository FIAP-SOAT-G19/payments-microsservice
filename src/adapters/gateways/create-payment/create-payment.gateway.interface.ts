import { CreatePaymentInput } from '@/usecases/create-payment/create-payment.usecase.interface'

export interface CreatePaymenteGatewayInterface {
  createPayment: (input: CreatePaymentInput) => Promise<string>
}
