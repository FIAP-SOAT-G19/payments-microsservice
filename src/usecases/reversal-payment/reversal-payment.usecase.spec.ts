import { ReversalPaymentUseCase } from './reversal-payment.usecase'
import { ProcessPaymentGatewayInterface } from '@/adapters/gateways/process-payment/process-payment.gateway.interface'
import { CrypotInterface } from '@/adapters/tools/crypto/crypto.adapter.interface'
import { CardDecryptionError } from '@/shared/errors'
import { logger } from '@/shared/helpers/logger.helper'
import { mock } from 'jest-mock-extended'
import MockDate from 'mockdate'

const gateway = mock<ProcessPaymentGatewayInterface>()
const crypto = mock<CrypotInterface>()

describe('ReversalPaymentUseCase', () => {
  let sut: ReversalPaymentUseCase

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
    sut = new ReversalPaymentUseCase(gateway, crypto)
    gateway.getPaymentByOrderNumber.mockResolvedValue(
      {
        id: 'anyPaymentId',
        cardId: 'anyCardId',
        orderNumber: 'anyOrderNumber',
        reason: '',
        status: 'waiting',
        totalValue: 3000
      }
    )

    gateway.getCardData.mockResolvedValue('anyCardData')
    crypto.decrypt.mockReturnValue({
      brand: 'anyBrand',
      cvv: 'anyCvv',
      number: 'anyNumber',
      expiryMonth: 'anyExpiryMonth',
      expiryYear: 'anyExpiryYear'
    })

    crypto.generateUUID.mockReturnValue('anyUUID')

    gateway.processExternalReversalPayment.mockResolvedValue({ status: 'reversed', totalValue: 3000 })
    gateway.sendMessageQueue.mockResolvedValue(true)
  })

  test('should call gateway.getPaymentByOrderNumber once and with correct orderNumber', async () => {
    await sut.execute('anyOrderNumber')

    expect(gateway.getPaymentByOrderNumber).toHaveBeenCalledTimes(1)
    expect(gateway.getPaymentByOrderNumber).toHaveBeenCalledWith('anyOrderNumber')
  })

  test('should call gateway.updatePaymentStatus with reversed status', async () => {
    await sut.execute('anyOrderNumber')

    expect(gateway.updatePaymentStatus).toHaveBeenCalledWith('anyPaymentId', 'reversed')
  })

  test('should call gateway.getCardData once and with correct cardId', async () => {
    await sut.execute('anyOrderNumber')

    expect(gateway.getCardData).toHaveBeenCalledTimes(1)
    expect(gateway.getCardData).toHaveBeenCalledWith('anyCardId')
  })

  test('should throw if gateway.getCardData throws', async () => {
    gateway.getCardData.mockRejectedValueOnce(new Error('Error get cardData'))

    await expect(sut.execute('anyOrderNumber')).rejects.toThrow(CardDecryptionError)
  })

  test('should call crypto.decrypt once and with correct value', async () => {
    await sut.execute('anyOrderNumber')

    expect(crypto.decrypt).toHaveBeenCalledTimes(1)
    expect(crypto.decrypt).toHaveBeenCalledWith('anyCardData')
  })

  test('should throw if crypto.decrypt throws', async () => {
    crypto.decrypt.mockImplementationOnce(() => { throw new Error('Error decrypt cardData') })

    await expect(sut.execute('anyOrderNumber')).rejects.toThrow(CardDecryptionError)
  })

  test('should throw if crypto.decrypt return null', async () => {
    crypto.decrypt.mockReturnValueOnce(null)

    await expect(sut.execute('anyOrderNumber')).rejects.toThrow(CardDecryptionError)
  })

  test('should call gateway.processExternalPayment once and with correct values', async () => {
    jest.spyOn(sut, 'getRandomCreditCard').mockReturnValue({
      brand: 'anyBrand',
      cvv: 'anyCvv',
      number: 'anyNumber',
      expiryMonth: 'anyExpiryMonth',
      expiryYear: 'anyExpiryYear'
    })

    await sut.execute('anyOrderNumber')

    expect(gateway.processExternalReversalPayment).toHaveBeenCalledTimes(1)
    expect(gateway.processExternalReversalPayment).toHaveBeenCalledWith({
      brand: 'anyBrand',
      cvv: 'anyCvv',
      number: 'anyNumber',
      expiryMonth: 'anyExpiryMonth',
      expiryYear: 'anyExpiryYear'
    }, 3000)
  })

  test('should call gateway.deleteCardData once and with correct cardId', async () => {
    await sut.execute('anyOrderNumber')

    expect(gateway.deleteCardData).toHaveBeenCalledTimes(1)
    expect(gateway.deleteCardData).toHaveBeenCalledWith('anyCardId')
  })
})
