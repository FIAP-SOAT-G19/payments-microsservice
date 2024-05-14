import { PaymentEntity } from '@/entities/payment/payment.entity'
import { CreatePaymentUseCase } from './create-payment.usecase'
import { CreatePaymentInput } from './create-payment.usecase.interface'
import { mock } from 'jest-mock-extended'
import { CreatePaymenteGatewayInterface } from '@/adapters/gateways/create-payment/create-payment.gateway.interface'
import MockDate from 'mockdate'

const gateway = mock<CreatePaymenteGatewayInterface>()

describe('CreatePaymentUseCase', () => {
  let sut: CreatePaymentUseCase
  let input: CreatePaymentInput

  beforeEach(() => {
    sut = new CreatePaymentUseCase(gateway)
    input = {
      id: 'anyId',
      orderNumber: 'anyOrderNumber',
      status: 'waiting',
      totalValue: 5000,
      createdAt: new Date()
    }

    jest.spyOn(PaymentEntity, 'build').mockReturnValue({
      id: 'AnyId',
      orderNumber: 'anyOrderNumber',
      totalValue: 5000,
      createdAt: new Date(),
      status: 'waiting'
    })
  })

  beforeAll(() => {
    MockDate.set(new Date())
  })

  afterAll(() => {
    MockDate.reset()
    jest.clearAllMocks()
  })

  test('should make a correct Payment', async () => {
    const spy = jest.spyOn(PaymentEntity, 'build')

    await sut.execute(input)

    expect(spy).toHaveBeenCalledTimes(1)
  })

  test('should call gateway.createPayment once and with correct values', async () => {
    await sut.execute(input)

    expect(gateway.createPayment).toHaveBeenCalledTimes(1)
    expect(gateway.createPayment).toHaveBeenCalledWith({
      id: 'AnyId',
      orderNumber: 'anyOrderNumber',
      totalValue: 5000,
      createdAt: new Date(),
      status: 'waiting'
    })
  })

  test('should return a payment id on success', async () => {
    const output = await sut.execute(input)

    expect(output).toBe('AnyId')
  })
})
