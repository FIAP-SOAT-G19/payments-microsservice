import { InvalidParamError, MissingParamError, PaymentNotFoundError } from '@/shared/errors'
import { CreatePaymentProductUseCase } from './create-payment-product.usecase'
import { CreatePaymentProductGatewayInterface } from '@/adapters/gateways/create-payment-product/create-payment-product.gateway.interface'
import { CrypotInterface } from '@/adapters/tools/crypto/crypto.adapter.interface'
import { mock } from 'jest-mock-extended'
import MockDate from 'mockdate'

const gateway = mock<CreatePaymentProductGatewayInterface>()
const crypto = mock<CrypotInterface>()

describe('CreatePaymentProductUseCase', () => {
  let sut: CreatePaymentProductUseCase
  let input: any

  beforeAll(() => {
    MockDate.set(new Date())
  })

  afterAll(() => {
    MockDate.reset()
    jest.clearAllMocks()
  })

  beforeEach(() => {
    sut = new CreatePaymentProductUseCase(gateway, crypto)
    input = {
      paymentId: 'anyPaymentId',
      name: 'anyName',
      category: 'anyCategory',
      price: 5000,
      description: 'anyDescription',
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

  test('should throw if a any required field is not provided', async () => {
    const requiredFields = ['paymentId', 'name', 'category', 'createdAt', 'updatedAt']

    for (const field of requiredFields) {
      input[field] = null

      const promise = sut.execute(input)

      await expect(promise).rejects.toThrow(new MissingParamError(field))

      input[field] = field
    }
  })

  test('should throw if a invalid price is provided', async () => {
    input.price = -1

    await expect(sut.execute(input)).rejects.toThrow(new InvalidParamError('price'))
  })

  test('should call gateway.getPaymentById once and with correct paymentId', async () => {
    await sut.execute(input)

    expect(gateway.getPaymentById).toHaveBeenCalledTimes(1)
    expect(gateway.getPaymentById).toHaveBeenCalledWith('anyPaymentId')
  })

  test('should throw if gateway.getPaymentById returns null', async () => {
    gateway.getPaymentById.mockResolvedValueOnce(null)

    await expect(sut.execute(input)).rejects.toThrow(new PaymentNotFoundError())
  })

  test('should call gateway.createPaymentProduct once and with correct paymentId', async () => {
    await sut.execute(input)

    expect(gateway.createPaymentProduct).toHaveBeenCalledTimes(1)
    expect(gateway.createPaymentProduct).toHaveBeenCalledWith({
      id: 'anyUUID',
      paymentId: 'anyPaymentId',
      name: 'anyName',
      category: 'anyCategory',
      price: 5000,
      description: 'anyDescription',
      createdAt: new Date(),
      updatedAt: new Date()
    })
  })
})
