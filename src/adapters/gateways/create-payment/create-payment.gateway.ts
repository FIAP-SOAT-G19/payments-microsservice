import { CreatePaymentInput } from '@/usecases/create-payment/create-payment.usecase.interface'
import { CreatePaymenteGatewayInterface } from './create-payment.gateway.interface'
import { prismaClient } from '../prisma.client'

export class CreatePaymentGateway implements CreatePaymenteGatewayInterface {
  async createPayment (data: CreatePaymentInput): Promise<string> {
    const payment = await prismaClient.payment.create({ data })
    return payment.id
  }
}
