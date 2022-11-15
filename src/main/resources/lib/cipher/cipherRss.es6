const cipher = __.newBean('no.ssb.xp.cipher.SimpleStreamCipher')

export function encryptRssNews(stringToEncrypt) {
  // Mistenker at man må lage en ByteArrayInputStream av stringToEncrypt
  const sharedSecret =
    app.config && app.config['ssb.rss.push.news.encryptionKey']
      ? app.config['ssb.rss.push.news.encryptionKey']
      : '_super_hemmelig_'
  return cipher.encrypt(sharedSecret, stringToEncrypt)
}

export function encryptRssStatkal(stringToEncrypt) {
  const sharedSecret =
    app.config && app.config['ssb.rss.push.statkal.encryptionKey']
      ? app.config['ssb.rss.push.statkal.encryptionKey']
      : '_super_hemmelig_'
  return cipher.encrypt(sharedSecret, stringToEncrypt)
}
