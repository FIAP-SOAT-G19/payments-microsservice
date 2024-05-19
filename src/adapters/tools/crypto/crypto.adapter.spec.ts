import { CryptoAdapter } from './crypto.adapter'
import { randomUUID } from 'crypto'

jest.mock('crypto', () => ({
  randomUUID: jest.fn().mockReturnValue('anyUUID')
}))

describe('CryptoAdapter', () => {
  let sut: CryptoAdapter

  beforeAll(() => {
    sut = new CryptoAdapter()
  })
  test('should call randomUUID once', () => {
    sut.generateUUID()

    expect(randomUUID).toHaveBeenCalledTimes(1)
  })

  test('should return a correct UUID', () => {
    const uuid = sut.generateUUID()

    expect(uuid).toBe('anyUUID')
  })
})
