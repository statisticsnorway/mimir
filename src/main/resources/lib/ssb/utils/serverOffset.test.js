import { getServerOffsetInMs } from './serverOffset'

// run npm run test:utc to run these tests with TZ=UTC
describe('date-fns-tz getServerOffsetInMs (UTC server)', () => {
  if (process.env.TZ === 'UTC') {
    test('winter returns 3600000', () => {
      const winterDay = new Date('2026-01-15T12:00:00Z')
      expect(getServerOffsetInMs('Europe/Oslo', winterDay)).toBe(3600000)
    })

    test('summer returns 7200000', () => {
      const summerDay = new Date('2026-07-15T12:00:00Z')
      expect(getServerOffsetInMs('Europe/Oslo', summerDay)).toBe(7200000)
    })
  } else {
    test.skip('serverOffset UTC tests (run with TZ=UTC)', () => {})
  }
})
