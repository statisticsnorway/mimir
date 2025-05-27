export function get(req: XP.Request): XP.Response {
  const value = req.params.value

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
        maxAge: 7776000,
        sameSite: 'Lax',
        secure: req.scheme === 'https',
      },
    },
  }
}
