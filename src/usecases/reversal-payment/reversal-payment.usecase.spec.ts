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
})
