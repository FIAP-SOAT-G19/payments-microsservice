import { isValidString } from '@/shared/helpers/string.helper'
import { BuildPaymentInput } from './payment.types'
import { InvalidParamError, MissingParamError } from '@/shared/errors'
import { isValidNumber } from '@/shared/helpers/number.helper'
import { randomUUID } from 'crypto'

export class PaymentEntity {
  constructor(
    public readonly id: string,
    public readonly orderNumber: string,
    public readonly totalValue: number,
    public readonly createdAt: Date,
    public readonly status: string,
    public readonly reason?: string
  ) {}

  public static build (input: BuildPaymentInput): PaymentEntity {
    this.validate(input)
    return this.create(input)
  }

  private static validate (input: BuildPaymentInput): void {
    if (!isValidString(input?.orderNumber)) {
      throw new MissingParamError('orderNumber')
    }

    if (!isValidNumber(input?.totalValue)) {
      throw new InvalidParamError('totalValue')
    }
  }

  private static create(input: BuildPaymentInput): PaymentEntity {
    const { orderNumber, totalValue } = input

    const id = input.id ?? randomUUID()
    const createdAt = input.createdAt ?? new Date()
    const status = input.status ?? 'waiting'
    const reason = input.reason ?? undefined

    return new PaymentEntity(id, orderNumber, totalValue, createdAt, status, reason)
  }
}
