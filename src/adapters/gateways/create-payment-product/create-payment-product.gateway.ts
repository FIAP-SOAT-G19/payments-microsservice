import { CreatePaymentGatewayInput, CreatePaymentProductGatewayInterface } from './create-payment-product.gateway.interface'
import { prismaClient } from '../prisma.client'
import { DefaultGateway } from '../default.gateway.interface'

export class CreatePaymentProductGateway extends DefaultGateway implements CreatePaymentProductGatewayInterface {
  async createPaymentProduct (input: CreatePaymentGatewayInput): Promise<void> {
    await prismaClient.paymentProducts.create({
      data: {
        id: input.id,
        name: input.name,
        category: input.category,
        description: input.description ?? '',
        price: input.price,
        paymentId: input.paymentId,
        image: input.image,
        createdAt: input.createdAt,
        updatedAt: input.updatedAt
      }
    })
  }
}
