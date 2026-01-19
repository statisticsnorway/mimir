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
describe('getServerOffsetInMs (UTC server)', () => {
  if (process.env.TZ === 'UTC') {
    test('winter returns 3600000', () => {
      const winterDay = new Date('2026-01-15T12:00:00Z')
      expect(getServerOffsetInMs(winterDay)).toBe(3600000)
    })

    test('summer returns 7200000', () => {
      const summerDay = new Date('2026-07-15T12:00:00Z')
      expect(getServerOffsetInMs(summerDay)).toBe(7200000)
    })
  } else {
    test.skip('serverOffset UTC tests (run with TZ=UTC)', () => {})
  }
})

// run npm run test:local to run these tests with TZ=Europe/Oslo
describe('getServerOffsetInMs (local Europe/Oslo runtime)', () => {
  if (process.env.TZ === 'Europe/Oslo') {
    test('returns 0 in winter', () => {
      const winterDay = new Date('2026-01-15T12:00:00')
      expect(getServerOffsetInMs(winterDay)).toBe(0)
    })

    test('returns 0 in summer', () => {
      const summerDay = new Date('2026-07-15T12:00:00')
      expect(getServerOffsetInMs(summerDay)).toBe(0)
    })
  } else {
    test.skip('local offset tests (run with TZ=Europe/Oslo)', () => {})
  }
})
