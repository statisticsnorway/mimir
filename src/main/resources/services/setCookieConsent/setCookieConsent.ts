import { type Request, type Response } from '@enonic-types/core'

export function get(req: Request): Response {
  let value = req.params.value
  if (Array.isArray(value)) {
    value = value.join()
  }

  if (!value || !['all', 'necessary', 'unidentified'].includes(value)) {
    return {
      status: 400,
      body: 'Invalid cookie-consent value',
    }
  }

  return {
    status: 200,
    body: JSON.stringify({ success: true, value }),
    contentType: 'application/json',
    cookies: {
      'cookie-consent': {
        value,
        path: '/',
        maxAge: 7776000, // 90 days
        sameSite: 'Lax',
        secure: req.scheme === 'https',
      },
    },
  }
}
