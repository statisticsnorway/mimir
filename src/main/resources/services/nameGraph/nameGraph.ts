import whitelist from 'validator/es/lib/whitelist'
import { prepareNameGraphResult } from '/lib/ssb/utils/nameSearchUtils'

export function get(req: XP.Request): XP.Response {
  if (!req.params.name) {
    return {
      body: {
        message: 'name parameter missing',
      },
      contentType: 'application/json',
    }
  }

  try {
    const preparedBody: string = prepareNameGraphResult(sanitizeQuery(req.params.name))

    return {
      body: preparedBody,
      status: 200,
      contentType: 'application/json',
    }
  } catch (err) {
    return {
      body: err,
      status: err.status ? err.status : 500,
      contentType: 'application/json',
    }
  }
}

export function sanitizeQuery(name: string): string {
  const approved = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ '
  return whitelist(replaceCharacters(name.toUpperCase()), approved)
}

export function replaceCharacters(name: string): string {
  return name
    .replace(/ÉÈ/g, 'E')
    .replace(/Ô/g, 'O')
    .replace(/'/g, '')
    .replace(/Ä/g, 'Æ')
    .replace(/Ü/g, 'Y')
    .replace(/Ö/g, 'Ø')
}
