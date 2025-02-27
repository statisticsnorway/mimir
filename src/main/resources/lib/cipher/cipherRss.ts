const cipher = __.newBean('no.ssb.xp.cipher.SimpleStreamCipher')

export function encryptRssNews(stringToEncrypt: string) {
  // Mistenker at man må lage en ByteArrayInputStream av stringToEncrypt
  const sharedSecret = app.config?.['ssb.rss.push.news.encryptionKey'] || '_super_hemmelig_'
  return cipher.encrypt(sharedSecret, stringToEncrypt)
}

export function encryptRssStatkal(stringToEncrypt: string) {
  const sharedSecret = app.config?.['ssb.rss.push.statkal.encryptionKey'] || '_super_hemmelig_'
  return cipher.encrypt(sharedSecret, stringToEncrypt)
}
