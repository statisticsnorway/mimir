import { getServerOffsetInMs } from './serverOffset'

const SUMMER_MONTH_START = 4 // April
const SUMMER_MONTH_END = 9 // September

const OSLO_WINTER_OFFSET_MINUTES = -60 // getTimezoneOffset(): UTC - local (winter UTC+1)
const OSLO_SUMMER_OFFSET_MINUTES = -120 // getTimezoneOffset(): UTC - local (summer UTC+2)

const OSLO_WINTER_OFFSET_SECONDS = 3600 // ZoneOffset total seconds (winter UTC+1)
const OSLO_SUMMER_OFFSET_SECONDS = 7200 // ZoneOffset total seconds (summer UTC+2)

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
              const month = new Date(instant.ms).getUTCMonth() + 1
              const isSummer = month >= SUMMER_MONTH_START && month <= SUMMER_MONTH_END
              // Simplified DST rule for tests: treat Apr–Sep as "summer time" (UTC+2), otherwise winter (UTC+1).
              return isSummer ? OSLO_SUMMER_OFFSET_SECONDS : OSLO_WINTER_OFFSET_SECONDS
            },
          }),
        }),
      },
    }
  },
  { virtual: true }
)

describe('getServerOffsetInMs', () => {
  let timezoneOffsetSpy

  afterEach(() => {
    if (timezoneOffsetSpy) {
      timezoneOffsetSpy.mockRestore()
      timezoneOffsetSpy = undefined
    }
  })

  describe('UTC runtime', () => {
    beforeEach(() => {
      timezoneOffsetSpy = jest.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(0)
    })

    test('winter returns 3600000', () => {
      const winterDay = new Date('2026-01-15T12:00:00Z')
      expect(getServerOffsetInMs(winterDay)).toBe(OSLO_WINTER_OFFSET_SECONDS * 1000)
    })

    test('summer returns 7200000', () => {
      const summerDay = new Date('2026-07-15T12:00:00Z')
      expect(getServerOffsetInMs(summerDay)).toBe(OSLO_SUMMER_OFFSET_SECONDS * 1000)
    })
  })

  describe('Europe/Oslo runtime', () => {
    // Mock the runtime timezone offset to simulate Europe/Oslo behavior.
    // getTimezoneOffset() returns minutes as (UTC - local):
    beforeEach(() => {
      timezoneOffsetSpy = jest.spyOn(Date.prototype, 'getTimezoneOffset').mockImplementation(function () {
        const month = this.getUTCMonth() + 1
        const isSummer = month >= SUMMER_MONTH_START && month <= SUMMER_MONTH_END
        return isSummer ? OSLO_SUMMER_OFFSET_MINUTES : OSLO_WINTER_OFFSET_MINUTES
      })
    })

    test('returns 0 in winter', () => {
      const winterDay = new Date('2026-01-15T12:00:00Z')
      expect(getServerOffsetInMs(winterDay)).toBe(0)
    })

    test('returns 0 in summer', () => {
      const summerDay = new Date('2026-07-15T12:00:00Z')
      expect(getServerOffsetInMs(summerDay)).toBe(0)
    })
  })
})
