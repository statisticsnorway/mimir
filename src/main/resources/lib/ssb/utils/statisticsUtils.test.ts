import { beforeAll, beforeEach, describe, expect, jest, test } from '@jest/globals'
import * as statisticsUtils from './statisticsUtils'

jest.mock(
  '/lib/time',
  () => ({
    DateTimeFormatter: { ISO_DATE_TIME: 'ISO_DATE_TIME' },
    formatDate: ({ date, pattern, timezoneId }: { date?: string; pattern?: string; timezoneId?: string }) => {
      if (!date || timezoneId !== 'Europe/Oslo' || pattern !== "yyyy-MM-dd'T'HH:mm:ss") return undefined
      const parsed = new Date(date)
      const month = parsed.getUTCMonth() + 1
      const isSummer = month >= 4 && month <= 9
      const shifted = new Date(parsed.getTime() + (isSummer ? 2 : 1) * 3600 * 1000)
      return shifted.toISOString().slice(0, 19)
    },
    LocalDateTime: { parse: jest.fn() },
    ZoneId: { of: jest.fn() },
    ZonedDateTime: { of: jest.fn() },
  }),
  { virtual: true }
)

jest.mock('/lib/ssb/utils/dateUtils', () => {
  const actual = jest.requireActual('/lib/ssb/utils/dateUtils') as typeof import('./dateUtils')
  return {
    ...actual,
    setDateTimeAsOsloTimeZone: (localDateTime: string) => {
      const month = Number.parseInt(localDateTime.slice(5, 7), 10)
      const isSummer = month >= 4 && month <= 9
      return `${localDateTime}${isSummer ? '+02:00' : '+01:00'}`
    },
  }
})

const mockFetchReleasesFromStatregApi = jest.fn()

jest.mock('/lib/ssb/statreg/statistics', () => ({
  fetchReleasesFromStatregApi: (...args: unknown[]) => mockFetchReleasesFromStatregApi(...args),
}))

jest.mock('/lib/ssb/utils/serverOffset', () => ({
  getServerOffsetInMs: jest.fn(() => 0),
}))

beforeAll(() => {
  jest.useFakeTimers()
})

beforeEach(() => {
  mockFetchReleasesFromStatregApi.mockReset()
  ;(globalThis as { app?: { config?: Record<string, string> } }).app = { config: {} }
})

const mockedReleases = [
  { publish_time: '2026-10-02T07:00:00.000Z' },
  { publish_time: '2026-11-02T07:00:00.000Z' },
  { publish_time: '2026-12-02T07:00:00.000Z' },
]

describe('getReleaseDatesFromStatregAPI', () => {
  test('keeps the 08:00 release as upcoming one second before publish time', () => {
    jest.setSystemTime(new Date('2026-10-02T06:59:59.000Z'))

    mockFetchReleasesFromStatregApi.mockReturnValueOnce([]).mockReturnValueOnce([mockedReleases[0], mockedReleases[1]])

    expect(statisticsUtils.getReleaseDatesFromStatregAPI('aku')).toEqual({
      previousReleaseDate: '',
      nextReleaseDate: '2026-10-02 08:00:00.0',
      previewNextReleaseDate: '2026-11-02 08:00:00.0',
    })
  })

  test('moves the 08:00 release to previous exactly at publish time', () => {
    jest.setSystemTime(new Date('2026-10-02T07:00:00.000Z'))

    mockFetchReleasesFromStatregApi
      .mockReturnValueOnce([mockedReleases[0]])
      .mockReturnValueOnce([mockedReleases[1], mockedReleases[2]])

    expect(statisticsUtils.getReleaseDatesFromStatregAPI('aku')).toEqual({
      previousReleaseDate: '2026-10-02 08:00:00.0',
      nextReleaseDate: '2026-11-02 08:00:00.0',
      previewNextReleaseDate: '2026-12-02 08:00:00.0',
    })
    expect(mockFetchReleasesFromStatregApi).toHaveBeenNthCalledWith(2, {
      count: 2,
      shortname: 'aku',
      sort: 'publish_time',
      approval_status: 'GODKJENT',
      publish_time_after: '2026-10-02T07:00:00.000Z',
    })
  })

  test('returns previous release even when there are no upcoming releases', () => {
    jest.setSystemTime(new Date('2026-12-03T07:00:00.000Z'))

    mockFetchReleasesFromStatregApi.mockReturnValueOnce([mockedReleases[2]]).mockReturnValueOnce([])

    expect(statisticsUtils.getReleaseDatesFromStatregAPI('aku')).toEqual({
      previousReleaseDate: '2026-12-02 08:00:00.0',
      nextReleaseDate: '',
      previewNextReleaseDate: '',
    })
  })
})

describe('getStatisticsDates', () => {
  const mockedPhrases = {
    notAvailable: 'Ikke tilgjengelig',
    notYetDetermined: 'Foreløpig ikke fastsatt',
  }

  const mockedStatisticsContent = {
    language: 'nb',
    data: {
      shortname: 'aku',
    },
  }

  const mockedPhrasesEn = {
    notAvailable: 'Not available',
    notYetDetermined: 'Not yet determined',
  }

  const mockedStatisticsContentEn = {
    language: 'en',
    data: {
      shortname: 'aku',
    },
  }

  test('formats StatReg API dates through the shared helper at the 08:00 boundary', () => {
    jest.setSystemTime(new Date('2026-10-02T08:00:00.000Z'))

    mockFetchReleasesFromStatregApi
      .mockReturnValueOnce([mockedReleases[0]])
      .mockReturnValueOnce([mockedReleases[1], mockedReleases[2]])

    expect(
      statisticsUtils.getStatisticsDates(
        mockedStatisticsContent as never,
        mockedPhrases as never,
        false,
        undefined,
        true
      )
    ).toEqual({
      changeDate: undefined,
      previousRelease: '2. oktober 2026',
      nextRelease: '2. november 2026',
    })
  })

  test('formats StatReg API dates eng loc through the shared helper at the 08:00 boundary', () => {
    mockFetchReleasesFromStatregApi
      .mockReturnValueOnce([mockedReleases[0]])
      .mockReturnValueOnce([mockedReleases[1], mockedReleases[2]])

    expect(
      statisticsUtils.getStatisticsDates(
        mockedStatisticsContentEn as never,
        mockedPhrasesEn as never,
        true,
        undefined,
        true
      )
    ).toEqual({
      changeDate: undefined,
      previousRelease: '2 November 2026',
      nextRelease: '2 December 2026',
    })
  })
})
