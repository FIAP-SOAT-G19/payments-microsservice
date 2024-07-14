import { InvalidParamError, MissingParamError, PaymentNotFoundError } from '@/shared/errors'
import { CreatePaymentProductUseCase } from './create-payment-product.usecase'
import { CreatePaymentProductGatewayInterface } from '@/adapters/gateways/create-payment-product/create-payment-product.gateway.interface'
import { CrypotInterface } from '@/adapters/tools/crypto/crypto.adapter.interface'
import { mock } from 'jest-mock-extended'
import MockDate from 'mockdate'
import { ProcessPaymentGatewayInterface } from '@/adapters/gateways/process-payment/process-payment.gateway.interface'
import { logger } from '@/shared/helpers/logger.helper'

const gateway = mock<CreatePaymentProductGatewayInterface>()
const crypto = mock<CrypotInterface>()
const processPaymentGateway = mock<ProcessPaymentGatewayInterface>()

describe('CreatePaymentProductUseCase', () => {
  let sut: CreatePaymentProductUseCase
  let input: any

  beforeAll(() => {
    MockDate.set(new Date())
    jest.spyOn(logger, 'info').mockImplementation(() => {})
  })

  afterAll(() => {
    MockDate.reset()
    jest.clearAllMocks()
  })

  beforeEach(() => {
    sut = new CreatePaymentProductUseCase(gateway, crypto, processPaymentGateway)
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
      id: 'anyPaymentId',
      orderNumber: 'anyOrderNumber',
      totalValue: 5000,
      cardId: 'anyCardId',
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

  test('should set payment to refused, call handleError and send a canceled status to order queue', async () => {
    process.env.QUEUE_UPDATE_ORDER_FIFO = 'https://sqs.us-east-1.amazonaws.com/975049990702/update_order.fifo'
    gateway.createPaymentProduct.mockRejectedValue(new Error('Error'))
    jest.spyOn(processPaymentGateway, 'sendMessageQueue').mockResolvedValue(true)

    await expect(sut.execute(input)).rejects.toThrow('Error creating payment products - order was canceled')

    expect(gateway.createPaymentProduct).toHaveBeenCalledTimes(1)
    expect(processPaymentGateway.updatePaymentStatus).toHaveBeenCalledTimes(1)
    expect(processPaymentGateway.updatePaymentStatus).toHaveBeenCalledWith('anyPaymentId', 'refused')
    expect(processPaymentGateway.sendMessageQueue).toHaveBeenCalledTimes(1)
    expect(processPaymentGateway.sendMessageQueue).toHaveBeenCalledWith(
      'https://sqs.us-east-1.amazonaws.com/975049990702/update_order.fifo',
      '{"status":"canceled","orderNumber":"anyOrderNumber"}',
      'processed_payment',
      'anyOrderNumber')
  })

  test('should set payment to refused, call handleError and throw error if sendMessageQueue return false', async () => {
    process.env.QUEUE_UPDATE_ORDER_FIFO = 'https://sqs.us-east-1.amazonaws.com/975049990702/update_order.fifo'
    gateway.createPaymentProduct.mockRejectedValue(new Error('Error'))
    jest.spyOn(processPaymentGateway, 'sendMessageQueue').mockResolvedValue(false)

    await expect(sut.execute(input)).rejects.toThrow('Error sending message queue')

    expect(gateway.createPaymentProduct).toHaveBeenCalledTimes(1)
    expect(processPaymentGateway.updatePaymentStatus).toHaveBeenCalledTimes(1)
    expect(processPaymentGateway.updatePaymentStatus).toHaveBeenCalledWith('anyPaymentId', 'refused')
    expect(processPaymentGateway.sendMessageQueue).toHaveBeenCalledTimes(1)
    expect(processPaymentGateway.sendMessageQueue).toHaveBeenCalledWith(
      'https://sqs.us-east-1.amazonaws.com/975049990702/update_order.fifo',
      '{"status":"canceled","orderNumber":"anyOrderNumber"}',
      'processed_payment',
      'anyOrderNumber')
  })
})
