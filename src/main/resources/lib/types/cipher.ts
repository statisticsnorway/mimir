export interface Cipher {
  encrypt: (secretKey: string, bios: string) => string
  decrypt: (secretKey: string, bios: string) => string
}
