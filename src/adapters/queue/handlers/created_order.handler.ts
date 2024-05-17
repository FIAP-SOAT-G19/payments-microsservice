import { CreatePaymentClientGateway } from '@/adapters/gateways/create-payment-client/create-payment-client.gateway'
import { CreatePaymentProductGateway } from '@/adapters/gateways/create-payment-product/create-payment-product.gateway'
import { CreatePaymentGateway } from '@/adapters/gateways/create-payment/create-payment.gateway'
import { Cryptodapter } from '@/adapters/tools/crypto/crypto.adapter'
import { CreatePaymentClientUseCase } from '@/usecases/create-payment-client/create-payment-client.usecase'
import { CreatePaymentClientInput } from '@/usecases/create-payment-client/create-payment-client.usecase.interface'
import { CreatePaymentProductUseCase } from '@/usecases/create-payment-product/create-payment-product.usecase'
import { CreatePaymentProductInput } from '@/usecases/create-payment-product/create-payment-product.usecase.interface'
import { CreatePaymentUseCase } from '@/usecases/create-payment/create-payment.usecase'
import constants from '@/shared/constants'

export class CreatedOrderHandler {
  async execute (message: any): Promise<void> {
    const { orderNumber, totalValue, products, client } = message

    const paymentId = await this.createPayment(orderNumber, totalValue, client?.id, client?.cpf)

    products.map(async (product: CreatePaymentProductInput) => {
      await this.createPaymentProducts(paymentId, product)
    })

    if (client) {
      await this.createPaymentClient(paymentId, client)
    }
  }

  async createPayment (orderNumber: string, totalValue: number, clientId?: string, clientDocument?: string): Promise<string> {
    const createPaymentGateway = new CreatePaymentGateway()
    const createPaymentUseCase = new CreatePaymentUseCase(createPaymentGateway)
    const paymentId = await createPaymentUseCase.execute({ orderNumber, status: constants.PAYMENT_STATUS.WAITING, totalValue, clientId, clientDocument })
    return paymentId
  }

  async createPaymentProducts (paymentId: string, product: CreatePaymentProductInput): Promise<void> {
    const createPaymentProductGateway = new CreatePaymentProductGateway()
    const crypto = new Cryptodapter()
    const createPaymentProductUseCase = new CreatePaymentProductUseCase(createPaymentProductGateway, crypto)
    await createPaymentProductUseCase.execute({
      paymentId,
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    })
  }

  async createPaymentClient (paymentId: string, client: CreatePaymentClientInput): Promise<void> {
    const createPaymentClientGateway = new CreatePaymentClientGateway()
    const crypto = new Cryptodapter()
    const createPaymentClientUseCase = new CreatePaymentClientUseCase(createPaymentClientGateway, crypto)
    await createPaymentClientUseCase.execute({
      identifier: client.identifier,
      name: client.name,
      email: client.email,
      cpf: client.cpf,
      paymentId,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt
    })
  }
}
