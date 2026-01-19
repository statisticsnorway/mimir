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
      expect(getServerOffsetInMs(winterDay)).toBe(3600000)
    })

    test('summer returns 7200000', () => {
      const summerDay = new Date('2026-07-15T12:00:00Z')
      expect(getServerOffsetInMs(summerDay)).toBe(7200000)
    })
  })

  describe('Europe/Oslo runtime', () => {
    beforeEach(() => {
      timezoneOffsetSpy = jest.spyOn(Date.prototype, 'getTimezoneOffset').mockImplementation(function () {
        const m = this.getUTCMonth() + 1
        return m >= 4 && m <= 9 ? -120 : -60
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
