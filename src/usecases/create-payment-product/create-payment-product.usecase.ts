import { isValidString } from '@/shared/helpers/string.helper'
import { CreatePaymentProductInput, CreatePaymentProductUseCaseInterface } from './create-payment-product.usecase.interface'
import { InvalidParamError, MissingParamError, PaymentNotFoundError } from '@/shared/errors'
import { CreatePaymentProductGatewayInterface } from '@/adapters/gateways/create-payment-product/create-payment-product.gateway.interface'
import { CrypotInterface } from '@/adapters/tools/crypto/crypto.adapter.interface'

export class CreatePaymentProductUseCase implements CreatePaymentProductUseCaseInterface {
  constructor(
    private readonly gateway: CreatePaymentProductGatewayInterface,
    private readonly crypto: CrypotInterface
  ) {}

  async execute (input: CreatePaymentProductInput): Promise<void> {
    await this.validate(input)
    await this.gateway.createPaymentProduct({
      id: this.crypto.generateUUID(),
      ...input
    })
  }

  async validate (input: CreatePaymentProductInput): Promise<void> {
    const requiredFields: Array<keyof Omit<CreatePaymentProductInput, 'description' | 'createdAt' | 'updatedAt' | 'image' | 'price' | 'amount'>> = ['paymentId', 'name', 'category']

    requiredFields.forEach(field => {
      if (!isValidString(input[field])) {
        throw new MissingParamError(field)
      }
    })

    if (!input.createdAt) {
      throw new MissingParamError('createdAt')
    }

    if (!input.updatedAt) {
      throw new MissingParamError('updatedAt')
    }

    if (!input.price || input.price < 0) {
      throw new InvalidParamError('price')
    }

    const paymentExists = await this.gateway.getPaymentById(input.paymentId)
    if (!paymentExists) {
      throw new PaymentNotFoundError()
    }
  }
}
