const cipher = __.newBean('no.ssb.xp.cipher.SimpleStreamCipher')

export function encrypt(stringToEncrypt: string) {
  const sharedSecret = app.config?.['ssb.secret.shared'] || '_super_hemmelig_'
  return cipher.encrypt(sharedSecret, stringToEncrypt)
}
