import { getServerOffsetInMs } from './serverOffset'

jest.mock(
  '/lib/time',
  () => {
    return {
      Instant: { ofEpochMilli: (ms) => ({ ms }) },
      ZoneId: { of: (id) => ({ id }) },
      ZonedDateTime: {
        ofInstant: (instant, zoneId) => ({
          getOffset: () => ({
            getTotalSeconds: () => {
              if (zoneId.id !== 'Europe/Oslo') return 0
              const m = new Date(instant.ms).getUTCMonth() + 1
              return m >= 4 && m <= 9 ? 7200 : 3600
            },
          }),
        }),
      },
    }
  },
  { virtual: true }
)

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
