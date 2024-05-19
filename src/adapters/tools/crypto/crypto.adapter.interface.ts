export interface CrypotInterface {
  generateUUID: () => string
  decrypt: (input: string) => any
}
