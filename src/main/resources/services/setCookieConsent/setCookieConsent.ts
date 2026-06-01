import { type Request, type Response } from '@enonic-types/core'

export function get(req: Request): Response {
  const value = req.params?.value?.toString()

  if (!value || !['all', 'necessary', 'unidentified'].includes(value)) {
    return {
      status: 400,
      body: 'Invalid ssbno-consent value',
    }
  }

  return {
    status: 200,
    body: JSON.stringify({ success: true, value }),
    contentType: 'application/json',
    cookies: {
      'ssbno-consent': {
        value,
        path: '/',
        maxAge: 7776000, // 90 dager
        sameSite: 'Lax',
        secure: req.scheme === 'https',
      },
    },
  }
}
