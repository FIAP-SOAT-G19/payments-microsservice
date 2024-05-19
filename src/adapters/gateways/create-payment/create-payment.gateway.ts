import { CreatePaymentGatewayInput, CreatePaymenteGatewayInterface } from './create-payment.gateway.interface'
import { prismaClient } from '../prisma.client'

export class CreatePaymentGateway implements CreatePaymenteGatewayInterface {
  async createPayment (data: CreatePaymentGatewayInput): Promise<string> {
    const payment = await prismaClient.payment.create({ data })
    return payment.id
  }
}
