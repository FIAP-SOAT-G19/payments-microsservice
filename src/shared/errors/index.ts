export class InvalidParamError extends Error {
  constructor(param: string) {
    super(`Invalid param: ${param}`)
    this.name = 'InvalidParamError'
    this.message = `Invalid param: ${param}`
  }
}

export class MissingParamError extends Error {
  constructor(param: string) {
    super(`Missing param: ${param}`)
    this.name = 'MissingParamError'
  }
}

export class ServerError extends Error {
  constructor(error?: Error) {
    super('Internal server error')
    this.name = 'ServerError'
    this.stack = error?.stack
  }
}

export class PaymentNotFoundError extends Error {
  constructor () {
    super('Payment not found error')
    this.name = 'NotFoundError'
  }
}

export class CardDecryptionError extends Error {
  constructor() {
    super('Card decryption error')
    this.name = 'CardDecryptionError'
  }
}
