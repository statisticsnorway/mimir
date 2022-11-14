const cipher = __.newBean('no.ssb.xp.cipher.SimpleStreamCipher')

export function encrypt(stringToEncrypt) {
  const sharedSecret =
    app.config && app.config['ssb.secret.shared'] ? app.config['ssb.secret.shared'] : '_super_hemmelig_'
  return cipher.encrypt(sharedSecret, stringToEncrypt)
}
