import { PaymentEntity } from '@/entities/payment/payment.entity'
import { CreatePaymentUseCase } from './create-payment.usecase'
import { CreatePaymentInput } from './create-payment.usecase.interface'
import { mock } from 'jest-mock-extended'
import { CreatePaymenteGatewayInterface } from '@/adapters/gateways/create-payment/create-payment.gateway.interface'
import MockDate from 'mockdate'
import { ProcessPaymentGatewayInterface } from '@/adapters/gateways/process-payment/process-payment.gateway.interface'
import { logger } from '@/shared/helpers/logger.helper'

const gateway = mock<CreatePaymenteGatewayInterface>()
const processPaymentGateway = mock<ProcessPaymentGatewayInterface>()

describe('CreatePaymentUseCase', () => {
  let sut: CreatePaymentUseCase
  let input: CreatePaymentInput

  beforeEach(() => {
    sut = new CreatePaymentUseCase(gateway, processPaymentGateway)
    input = {
      id: 'anyId',
      orderNumber: 'anyOrderNumber',
      cardId: 'anyCardId',
      status: 'waiting',
      totalValue: 5000,
      createdAt: new Date()
    }

    jest.spyOn(PaymentEntity, 'build').mockReturnValue({
      id: 'AnyId',
      orderNumber: 'anyOrderNumber',
      totalValue: 5000,
      cardId: 'anyCardId',
      createdAt: new Date(),
      status: 'waiting'
    })
    jest.spyOn(gateway, 'createPayment').mockResolvedValue('AnyId')
  })

  beforeAll(() => {
    MockDate.set(new Date())
    jest.spyOn(logger, 'info').mockImplementation(() => {})
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
      cardId: 'anyCardId',
      createdAt: new Date(),
      status: 'waiting'
    })
  })

  test('should return a payment id on success', async () => {
    const output = await sut.execute(input)

    expect(output).toBe('AnyId')
  })

  test('should call handleError and send a canceled status to order queue', async () => {
    process.env.QUEUE_UPDATE_ORDER_FIFO = 'https://sqs.us-east-1.amazonaws.com/975049990702/update_order.fifo'
    jest.spyOn(gateway, 'createPayment').mockResolvedValue('')
    jest.spyOn(processPaymentGateway, 'sendMessageQueue').mockResolvedValue(true)

    await expect(sut.execute(input)).rejects.toThrow('Error creating payment - order was canceled')

    expect(gateway.createPayment).toHaveBeenCalledTimes(1)
    expect(gateway.createPayment).toHaveBeenCalledWith({
      id: 'AnyId',
      orderNumber: 'anyOrderNumber',
      totalValue: 5000,
      cardId: 'anyCardId',
      createdAt: new Date(),
      status: 'waiting'
    })
    expect(processPaymentGateway.sendMessageQueue).toHaveBeenCalledTimes(1)
    expect(processPaymentGateway.sendMessageQueue).toHaveBeenCalledWith(
      'https://sqs.us-east-1.amazonaws.com/975049990702/update_order.fifo',
      '{"status":"canceled","orderNumber":"anyOrderNumber"}',
      'processed_payment',
      'anyOrderNumber')
  })

  test('should call handleError and throw error if sendMessageQueue return false', async () => {
    process.env.QUEUE_UPDATE_ORDER_FIFO = 'https://sqs.us-east-1.amazonaws.com/975049990702/update_order.fifo'
    jest.spyOn(gateway, 'createPayment').mockResolvedValue('')
    jest.spyOn(processPaymentGateway, 'sendMessageQueue').mockResolvedValue(false)

    await expect(sut.execute(input)).rejects.toThrow('Error sending message queue')

    expect(gateway.createPayment).toHaveBeenCalledTimes(1)
    expect(gateway.createPayment).toHaveBeenCalledWith({
      id: 'AnyId',
      orderNumber: 'anyOrderNumber',
      totalValue: 5000,
      cardId: 'anyCardId',
      createdAt: new Date(),
      status: 'waiting'
    })
    expect(processPaymentGateway.sendMessageQueue).toHaveBeenCalledTimes(1)
    expect(processPaymentGateway.sendMessageQueue).toHaveBeenCalledWith(
      'https://sqs.us-east-1.amazonaws.com/975049990702/update_order.fifo',
      '{"status":"canceled","orderNumber":"anyOrderNumber"}',
      'processed_payment',
      'anyOrderNumber')
  })
})
