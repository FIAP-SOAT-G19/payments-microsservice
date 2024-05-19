import { CrypotInterface } from './crypto.adapter.interface'
import { randomUUID } from 'crypto'

export class CryptoAdapter implements CrypotInterface {
  generateUUID (): string {
    return randomUUID()
  }

  decrypt (input: string): any {
    const bytes = CryptoJS.AES.decrypt(input, process.env.ENCRYPT_KEY!)
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
  }
}
