import { InvalidParamError, MissingParamError } from '@/shared/errors'
import { CreatePaymentClientUseCase } from './create-payment-client.usecase'
import { CreatePaymentClientGatewayInterface } from '@/adapters/gateways/create-payment-client/create-payment-client.gateway.interface'
import { CrypotInterface } from '@/adapters/tools/crypto/crypto.adapter.interface'
import { mock } from 'jest-mock-extended'
import MockDate from 'mockdate'
import { ProcessPaymentGatewayInterface } from '@/adapters/gateways/process-payment/process-payment.gateway.interface'
import { logger } from '@/shared/helpers/logger.helper'

const gateway = mock<CreatePaymentClientGatewayInterface>()
const crypto = mock<CrypotInterface>()
const processPaymentGateway = mock<ProcessPaymentGatewayInterface>()

describe('CreatePaymentClientUseCase', () => {
  let sut: CreatePaymentClientUseCase
  let input: any

  beforeEach(() => {
    sut = new CreatePaymentClientUseCase(gateway, crypto, processPaymentGateway)
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
      id: 'anyPaymentId',
      orderNumber: 'anyOrderNumber',
      totalValue: 5000,
      cardId: 'anyCardId',
      createdAt: new Date(),
      status: 'waiting'
    })

    crypto.generateUUID.mockReturnValue('anyUUID')
  })

  beforeAll(() => {
    MockDate.set(new Date())
    jest.spyOn(logger, 'info').mockImplementation(() => {})
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

  test('should set payment to refused, delete payment product, call handleError and send a canceled status to order queue', async () => {
    process.env.QUEUE_UPDATE_ORDER_FIFO = 'https://sqs.us-east-1.amazonaws.com/975049990702/update_order.fifo'
    gateway.createPaymentClient.mockRejectedValue(new Error('Error'))
    jest.spyOn(processPaymentGateway, 'sendMessageQueue').mockResolvedValue(true)

    await expect(sut.execute(input)).rejects.toThrow('Error creating payment client - order was canceled')

    expect(gateway.createPaymentClient).toHaveBeenCalledTimes(1)
    expect(processPaymentGateway.updatePaymentStatus).toHaveBeenCalledTimes(1)
    expect(processPaymentGateway.updatePaymentStatus).toHaveBeenCalledWith('anyPaymentId', 'refused')
    expect(processPaymentGateway.deletePaymentProductById).toHaveBeenCalledTimes(1)
    expect(processPaymentGateway.deletePaymentProductById).toHaveBeenCalledWith('anyPaymentId')
    expect(processPaymentGateway.sendMessageQueue).toHaveBeenCalledTimes(1)
    expect(processPaymentGateway.sendMessageQueue).toHaveBeenCalledWith(
      'https://sqs.us-east-1.amazonaws.com/975049990702/update_order.fifo',
      '{"status":"canceled","orderNumber":"anyOrderNumber"}',
      'processed_payment',
      'anyOrderNumber')
  })

  test('should set payment to refused, delete payment product, call handleError nd throw error if sendMessageQueue return false', async () => {
    process.env.QUEUE_UPDATE_ORDER_FIFO = 'https://sqs.us-east-1.amazonaws.com/975049990702/update_order.fifo'
    gateway.createPaymentClient.mockRejectedValue(new Error('Error'))
    jest.spyOn(processPaymentGateway, 'sendMessageQueue').mockResolvedValue(false)

    await expect(sut.execute(input)).rejects.toThrow('Error sending message queue')

    expect(gateway.createPaymentClient).toHaveBeenCalledTimes(1)
    expect(processPaymentGateway.updatePaymentStatus).toHaveBeenCalledTimes(1)
    expect(processPaymentGateway.updatePaymentStatus).toHaveBeenCalledWith('anyPaymentId', 'refused')
    expect(processPaymentGateway.deletePaymentProductById).toHaveBeenCalledTimes(1)
    expect(processPaymentGateway.deletePaymentProductById).toHaveBeenCalledWith('anyPaymentId')
    expect(processPaymentGateway.sendMessageQueue).toHaveBeenCalledTimes(1)
    expect(processPaymentGateway.sendMessageQueue).toHaveBeenCalledWith(
      'https://sqs.us-east-1.amazonaws.com/975049990702/update_order.fifo',
      '{"status":"canceled","orderNumber":"anyOrderNumber"}',
      'processed_payment',
      'anyOrderNumber')
  })
})
