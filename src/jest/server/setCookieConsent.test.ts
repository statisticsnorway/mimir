import { describe, expect, test as it } from '@jest/globals'
import { mockLibPortal, Request } from './mockXP'

const COOKIE_NAME = 'cookie-consent'
const SERVICE_URL = '/_/service/mimir/setCookieConsent'
const MAX_AGE = 90 * 24 * 60 * 60 // 90 days

// tests
describe('setCookieConsent ', () => {
  it('returns status 200 and cookie with correct value for cookie-consent all', async () => {
    const value = 'all'
    mockLibPortal.request = new Request({ path: SERVICE_URL, params: { value }, scheme: 'https' })
    const { get } = await import('../../main/resources/services/setCookieConsent/setCookieConsent')
    const response = get(mockLibPortal.request)
    expect(response.status).toBe(200)
    console.log(response)
    expect(response.cookies[COOKIE_NAME]).toEqual({
      value,
      path: '/',
      maxAge: MAX_AGE,
      sameSite: 'Lax',
      secure: true,
    })
  })
  // TODO: tester for inputs som har gyldig verdi i en lengre string og flere verdier
  // TODO: teste for ugyldige inputs
  // TODO: teste for manglende input
})
