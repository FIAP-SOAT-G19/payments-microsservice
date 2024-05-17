import { PaymentEntity } from '@/entities/payment/payment.entity'
import { prismaClient } from './prisma.client'

export class DefaultGateway {
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
