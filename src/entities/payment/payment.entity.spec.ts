import { InvalidParamError, MissingParamError } from '@/shared/errors'
import { PaymentEntity } from './payment.entity'
import MockDate from 'mockdate'

jest.mock('crypto', () => ({
  randomUUID: jest.fn().mockReturnValue('AnyId')
}))

describe('PaymentEntity', () => {
  let sut: any
  let input: any

  beforeEach(() => {
    sut = PaymentEntity
    input = {
      orderNumber: 'anyOrderNumber',
      totalValue: 5000,
      products: [{
        id: 'anyProductId',
        category: 'anyCategory',
        description: 'AnyDescription',
        image: 'anyImage',
        name: 'AnyName',
        price: 2500,
        createdAt: new Date(),
        updatedAt: new Date()
      }]
    }
  })

  beforeAll(() => {
    MockDate.set(new Date())
  })

  afterAll(() => {
    MockDate.reset()
  })

  test('should throw if a invalid orderNumber is provided', () => {
    input.orderNumber = null
    expect(() => {
      sut.build(input)
    }).toThrow(new MissingParamError('orderNumber'))
  })

  test('should throw if a invalid totalValue is provided', () => {
    input.totalValue = -1
    expect(() => {
      sut.build(input)
    }).toThrow(new InvalidParamError('totalValue'))
  })

  test('should make a correct Payment Entity', () => {
    const payment = sut.build(input)

    expect(payment).toEqual({
      id: 'AnyId',
      orderNumber: 'anyOrderNumber',
      totalValue: 5000,
      createdAt: new Date(),
      status: 'waiting'
    })
  })
})
