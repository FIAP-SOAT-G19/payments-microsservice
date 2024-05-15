import { PaymentEntity } from '@/entities/payment/payment.entity'
import { CreatePaymentGatewayInput, CreatePaymentProductGatewayInterface } from './create-payment-product.gateway.interface'
import { prismaClient } from '../prisma.client'

export class CreatePaymentProductGateway implements CreatePaymentProductGatewayInterface {
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

  async getPaymentById (paymentId: string): Promise<PaymentEntity | null> {
    const payment = await prismaClient.payment.findFirst({ where: { id: paymentId } })
    if (!payment) {
      return null
    }

    return {
      id: payment.id,
      orderNumber: payment.orderNumber,
      status: payment.status,
      totalValue: payment.totalValue,
      clientId: payment.clientId ?? undefined,
      clientDocument: payment.clientDocument ?? undefined,
      reason: payment.reason ?? undefined,
      createdAt: payment.createdAt
    }
  }
}
