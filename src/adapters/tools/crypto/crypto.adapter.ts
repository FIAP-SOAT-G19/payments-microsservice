import { CrypotInterface } from './crypto.adapter.interface'
import { randomUUID } from 'crypto'

export class Cryptodapter implements CrypotInterface {
  generateUUID (): string {
    return randomUUID()
  }
}
