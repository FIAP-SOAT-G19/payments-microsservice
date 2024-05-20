import { ProcessPaymentUseCase } from './process-payment.usecase'
import { ProcessPaymentGatewayInterface } from '@/adapters/gateways/process-payment/process-payment.gateway.interface'
import { CrypotInterface } from '@/adapters/tools/crypto/crypto.adapter.interface'
import { logger } from '@/shared/helpers/logger.helper'
import { mock } from 'jest-mock-extended'
import MockDate from 'mockdate'

const gateway = mock<ProcessPaymentGatewayInterface>()
const crypto = mock<CrypotInterface>()

process.env.QUEUE_APROVED_PAYMENT = 'https://sqs.us-east-1.amazonaws.com/975049990702/approved_payment.fifo'
process.env.QUEUE_UNAUTHORIZED_PAYMENT = 'https://sqs.us-east-1.amazonaws.com/975049990702/unauthorized_payment.fifo'

describe('ProcessPaymentUseCase', () => {
  let sut: ProcessPaymentUseCase

  beforeAll(() => {
    MockDate.set(new Date())
    jest.spyOn(logger, 'info').mockImplementation(() => {})
    jest.spyOn(logger, 'error').mockImplementation(() => {})
  })

  afterAll(() => {
    MockDate.reset()
    jest.clearAllMocks()
  })

  beforeEach(() => {
    sut = new ProcessPaymentUseCase(gateway, crypto)
    gateway.getPaymentByStatus.mockResolvedValue([{
      payment: {
        id: 'anyPaymentId',
        cardId: 'anyCardId',
        orderNumber: 'anyOrderNumber',
        reason: '',
        status: 'waiting',
        totalValue: 3000
      },
      products: [{
        name: 'product_1',
        category: 'anyCategory',
        description: 'anyDescription',
        amount: 2,
        price: 1500
      }],
      client: {
        id: 'anyClientId',
        identifier: 'anyClientIdentifier',
        name: 'anyClientName',
        email: 'anyClientEmail',
        cpf: 'anyClientDocument'
      }
    }])

    gateway.getCardData.mockResolvedValue('anyCardData')
    crypto.decrypt.mockReturnValue({
      brand: 'anyBrand',
      cvv: 'anyCvv',
      number: 'anyNumber',
      expiryMonth: 'anyExpiryMonth',
      expiryYear: 'anyExpiryYear'
    })

    crypto.generateUUID.mockReturnValue('anyUUID')

    gateway.processExternalPayment.mockResolvedValue({ status: 'approved' })
    gateway.sendMessageQueue.mockResolvedValue(true)
  })

  test('should call gateway.getPaymentByStatus once and with correct status', async () => {
    await sut.execute()

    expect(gateway.getPaymentByStatus).toHaveBeenCalledTimes(1)
    expect(gateway.getPaymentByStatus).toHaveBeenCalledWith('waiting')
  })

  test('should call gateway.updatePaymentStatus with correct status', async () => {
    await sut.execute()

    expect(gateway.updatePaymentStatus).toHaveBeenCalledWith('anyPaymentId', 'processing')
  })

  test.skip('should call gateway.getCardData once and with correct cardId', async () => {
    await sut.execute()

    expect(gateway.getCardData).toHaveBeenCalledTimes(1)
    expect(gateway.getCardData).toHaveBeenCalledWith('anyCardId')
  })

  test.skip('should throw if gateway.getCardData throws', async () => {
    gateway.getCardData.mockRejectedValueOnce(new Error('Error get cardData'))

    await expect(sut.execute()).rejects.toThrow('Error get cardData')
  })

  test.skip('should call crypto.decrypt once and with correct value', async () => {
    await sut.execute()

    expect(crypto.decrypt).toHaveBeenCalledTimes(1)
    expect(crypto.decrypt).toHaveBeenCalledWith('anyCardData')
  })

  test.skip('should throw if crypto.decrypt throws', async () => {
    crypto.decrypt.mockImplementationOnce(() => { throw new Error('Error decrypt cardData') })

    await expect(sut.execute()).rejects.toThrow('Error decrypt cardData')
  })

  test.skip('should throw if crypto.decrypt return null', async () => {
    crypto.decrypt.mockReturnValueOnce(null)

    await expect(sut.execute()).rejects.toThrow('Invalid credit card data')
  })

  test('should call gateway.processExternalPayment once and with correct values', async () => {
    jest.spyOn(sut, 'getRandomCreditCard').mockReturnValue({
      brand: 'anyBrand',
      cvv: 'anyCvv',
      number: 'anyNumber',
      expiryMonth: 'anyExpiryMonth',
      expiryYear: 'anyExpiryYear'
    })

    await sut.execute()

    expect(gateway.processExternalPayment).toHaveBeenCalledTimes(1)
    expect(gateway.processExternalPayment).toHaveBeenCalledWith({
      brand: 'anyBrand',
      cvv: 'anyCvv',
      number: 'anyNumber',
      expiryMonth: 'anyExpiryMonth',
      expiryYear: 'anyExpiryYear'
    }, 3000)
  })

  test('should call gateway.sendMessageQueue with correct status when payment is approved', async () => {
    await sut.execute()

    expect(gateway.sendMessageQueue).toHaveBeenCalledTimes(1)
    expect(gateway.sendMessageQueue).toHaveBeenCalledWith(
      'https://sqs.us-east-1.amazonaws.com/975049990702/approved_payment.fifo',
      JSON.stringify({
        orderNumber: 'anyOrderNumber',
        totalValue: 3000,
        cardIdentifier: 'anyCardId',
        products: [
          {
            name: 'product_1',
            category: 'anyCategory',
            description: 'anyDescription',
            amount: 2,
            price: 1500
          }
        ],
        client: {
          id: 'anyClientId',
          identifier: 'anyClientIdentifier',
          name: 'anyClientName',
          email: 'anyClientEmail',
          cpf: 'anyClientDocument'
        }
      }),
      'processed_payment',
      'anyOrderNumber'
    )
  })

  test('should call gateway.sendMessageQueue with correct status when payment is unauthorized', async () => {
    gateway.processExternalPayment.mockResolvedValueOnce({ status: 'refused', reason: 'anyReason' })

    await sut.execute()

    expect(gateway.sendMessageQueue).toHaveBeenCalledTimes(1)
    expect(gateway.sendMessageQueue).toHaveBeenCalledWith(
      'https://sqs.us-east-1.amazonaws.com/975049990702/unauthorized_payment.fifo',
      JSON.stringify({
        status: 'canceled',
        reason: 'anyReason',
        orderNumber: 'anyOrderNumber'
      }),
      'processed_payment',
      'anyOrderNumber'
    )
  })

  test('should call gateway.updatePaymentStatus with correct status', async () => {
    await sut.execute()

    expect(gateway.updatePaymentStatus).toHaveBeenCalledWith('anyPaymentId', 'approved')
  })

  test('should throw if gateway.sendMessageQueue fails', async () => {
    gateway.sendMessageQueue.mockResolvedValueOnce(false)

    await expect(sut.execute()).rejects.toThrow('Error sending message queue')
  })

  test('should call gateway.createPublishedMessageLog once and with correct values', async () => {
    await sut.execute()

    expect(gateway.createPublishedMessageLog).toHaveBeenCalledTimes(1)
    expect(gateway.createPublishedMessageLog).toHaveBeenCalledWith({
      id: 'anyUUID',
      queue: 'https://sqs.us-east-1.amazonaws.com/975049990702/approved_payment.fifo',
      origin: 'ProcessPaymentUseCase',
      message: JSON.stringify({
        orderNumber: 'anyOrderNumber',
        totalValue: 3000,
        cardIdentifier: 'anyCardId',
        products: [
          {
            name: 'product_1',
            category: 'anyCategory',
            description: 'anyDescription',
            amount: 2,
            price: 1500
          }
        ],
        client: {
          id: 'anyClientId',
          identifier: 'anyClientIdentifier',
          name: 'anyClientName',
          email: 'anyClientEmail',
          cpf: 'anyClientDocument'
        }
      }),
      createdAt: new Date()
    })
  })

  test('should call gateway.deleteCardData once and with correct cardId', async () => {
    await sut.execute()

    expect(gateway.deleteCardData).toHaveBeenCalledTimes(1)
    expect(gateway.deleteCardData).toHaveBeenCalledWith('anyCardId')
  })
})
