import { isValidString } from '@/shared/helpers/string.helper'
import { CreatePaymentClientInput, CreatePaymentClientUseCaseInterface } from './create-payment-client.usecase.interface'
import { InvalidParamError, MissingParamError } from '@/shared/errors'
import { CreatePaymentClientGatewayInterface } from '@/adapters/gateways/create-payment-client/create-payment-client.gateway.interface'
import { CrypotInterface } from '@/adapters/tools/crypto/crypto.adapter.interface'

export class CreatePaymentClientUseCase implements CreatePaymentClientUseCaseInterface {
  constructor(
    private readonly gateway: CreatePaymentClientGatewayInterface,
    private readonly crypto: CrypotInterface
  ) {}

  async execute (input: CreatePaymentClientInput): Promise<void> {
    await this.validate(input)
    await this.gateway.createPaymentClient({ id: this.crypto.generateUUID(), ...input })
  }

  async validate (input: CreatePaymentClientInput): Promise<void> {
    const requiredFields: Array<keyof Omit<CreatePaymentClientInput, 'createdAt' | 'updatedAt'>> = ['paymentId', 'identifier', 'name', 'cpf', 'email']

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

    const paymentExists = await this.gateway.getPaymentById(input.paymentId)

    if (!paymentExists) {
      throw new InvalidParamError('paymentId')
    }
  }
}
