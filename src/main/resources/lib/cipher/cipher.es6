
const cipher = __.newBean('no.ssb.xp.cipher.SimpleStreamCipher')

export function createHeaderAuthorizationToken(username, password) {
  const userNamePasswordCombo = `${username}:${password}`
  const sharedSecret = app.config && app.config['ssb.secret.shared'] ? app.config['ssb.secret.shared'] : '_super_hemmelig_' //16 characters long
  const encoded = cipher.encrypt(sharedSecret, stringToUtf32ByteArray(userNamePasswordCombo))
  return encoded
}

function stringToUtf32ByteArray(str) {
  const bytes = [];
  //currently the function returns without BOM. Uncomment the next line to change that.
  //bytes.push(0, 0, 254, 255);  //Big Endian Byte Order Marks
  for (let i = 0; i < str.length; i+=2) {
    const charPoint = str.codePointAt(i);
    //char > 4 bytes is impossible since codePointAt can only return 4 bytes
    bytes.push((charPoint & 0xFF000000) >>> 24);
    bytes.push((charPoint & 0xFF0000) >>> 16);
    bytes.push((charPoint & 0xFF00) >>> 8);
    bytes.push(charPoint & 0xFF);
  }
  return bytes;
}
