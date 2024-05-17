import { InvalidParamError, MissingParamError } from '@/shared/errors'
import { CreatePaymentClientUseCase } from './create-payment-client.usecase'
import { CreatePaymentClientGatewayInterface } from '@/adapters/gateways/create-payment-client/create-payment-client.gateway.interface'
import { CrypotInterface } from '@/adapters/tools/crypto/crypto.adapter.interface'
import { mock } from 'jest-mock-extended'
import MockDate from 'mockdate'

const gateway = mock<CreatePaymentClientGatewayInterface>()
const crypto = mock<CrypotInterface>()

describe('CreatePaymentClientUseCase', () => {
  let sut: CreatePaymentClientUseCase
  let input: any

  beforeEach(() => {
    sut = new CreatePaymentClientUseCase(gateway, crypto)
    input = {
      paymentId: 'anyPaymentId',
      identifier: 'anyIdentifier',
      name: 'AnyName',
      cpf: 'anyCpf',
      email: 'anyEmail',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    gateway.getPaymentById.mockResolvedValue({
      id: 'AnyId',
      orderNumber: 'anyOrderNumber',
      totalValue: 5000,
      createdAt: new Date(),
      status: 'waiting'
    })

    crypto.generateUUID.mockReturnValue('anyUUID')
  })

  beforeAll(() => {
    MockDate.set(new Date())
  })

  afterAll(() => {
    MockDate.reset()
  })

  test('should throw if a any required field is not provided', async () => {
    const requiredFields = ['paymentId', 'identifier', 'name', 'cpf', 'email', 'createdAt', 'updatedAt']

    for (const field of requiredFields) {
      input[field] = null

      const promise = sut.execute(input)

      await expect(promise).rejects.toThrow(new MissingParamError(field))

      input[field] = field
    }
  })

  test('should call gateway.getPaymentById once and with correct values', async () => {
    await sut.execute(input)

    expect(gateway.getPaymentById).toHaveBeenCalledTimes(1)
    expect(gateway.getPaymentById).toHaveBeenCalledWith('anyPaymentId')
  })

  test('should throw if gateway.getPaymentById returns null', async () => {
    gateway.getPaymentById.mockResolvedValueOnce(null)

    await expect(sut.execute(input)).rejects.toThrow(new InvalidParamError('paymentId'))
  })

  test('should call gateway.createPaymentClient once and with correct values', async () => {
    await sut.execute(input)

    expect(gateway.createPaymentClient).toHaveBeenCalledTimes(1)
    expect(gateway.createPaymentClient).toHaveBeenCalledWith({
      id: 'anyUUID',
      paymentId: 'anyPaymentId',
      identifier: 'anyIdentifier',
      name: 'AnyName',
      cpf: 'anyCpf',
      email: 'anyEmail',
      createdAt: new Date(),
      updatedAt: new Date()
    })
  })
})
