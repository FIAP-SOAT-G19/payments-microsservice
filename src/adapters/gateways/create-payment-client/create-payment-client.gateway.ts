import { DefaultGateway } from '../default.gateway.interface'
import { prismaClient } from '../prisma.client'
import { CreatePaymentClientGatewayInput, CreatePaymentClientGatewayInterface } from './create-payment-client.gateway.interface'

export class CreatePaymentClientGateway extends DefaultGateway implements CreatePaymentClientGatewayInterface {
  async createPaymentClient (data: CreatePaymentClientGatewayInput): Promise<void> {
    await prismaClient.paymentClient.create({ data })
  }
}
