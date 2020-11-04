import {Base64} from 'js-base64'

const cipher = __.newBean('no.ssb.xp.cipher.SimpleStreamCipher')

export function createHeaderAuthorizationToken(username, password) {
  const sharedSecret = app.config && app.config['ssb.secret.shared'] ? app.config['ssb.secret.shared'] : '_super_hemmelig_'
  return `${Base64.encodeURI(`${username}:${cipher.encrypt(sharedSecret, password)}`)}=`
}
