import { beforeAll, beforeEach, describe, expect, jest, test } from '@jest/globals'
import * as statisticsUtils from './statisticsUtils'

jest.mock(
  '/lib/time',
  () => ({
    DateTimeFormatter: { ISO_DATE_TIME: 'ISO_DATE_TIME' },
    formatDate: jest.fn(),
    LocalDateTime: { parse: jest.fn() },
    ZoneId: { of: jest.fn() },
    ZonedDateTime: { of: jest.fn() },
  }),
  { virtual: true }
)

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
  { publish_time: '2026-10-02T08:00:00.000Z' },
  { publish_time: '2026-11-02T08:00:00.000Z' },
  { publish_time: '2026-12-02T08:00:00.000Z' },
]

describe('getReleaseDatesFromStatregAPI', () => {
  test('keeps the 08:00 release as upcoming one second before publish time', () => {
    jest.setSystemTime(new Date('2026-10-02T07:59:59.000Z'))

    mockFetchReleasesFromStatregApi.mockReturnValueOnce([]).mockReturnValueOnce([mockedReleases[0], mockedReleases[1]])

    expect(statisticsUtils.getReleaseDatesFromStatregAPI('aku')).toEqual({
      previousReleaseDate: '',
      nextReleaseDate: '2026-10-02T08:00:00.000Z',
      previewNextReleaseDate: '2026-11-02T08:00:00.000Z',
    })
  })

  test('moves the 08:00 release to previous exactly at publish time', () => {
    jest.setSystemTime(new Date('2026-10-02T08:00:00.000Z'))

    mockFetchReleasesFromStatregApi
      .mockReturnValueOnce([mockedReleases[0]])
      .mockReturnValueOnce([mockedReleases[1], mockedReleases[2]])

    expect(statisticsUtils.getReleaseDatesFromStatregAPI('aku')).toEqual({
      previousReleaseDate: '2026-10-02T08:00:00.000Z',
      nextReleaseDate: '2026-11-02T08:00:00.000Z',
      previewNextReleaseDate: '2026-12-02T08:00:00.000Z',
    })
    expect(mockFetchReleasesFromStatregApi).toHaveBeenNthCalledWith(2, {
      count: 2,
      shortname: 'aku',
      sort: 'publish_time',
      approval_status: 'GODKJENT',
      publish_time_after: '2026-10-02T08:00:00.000Z',
    })
  })

  test('returns previous release even when there are no upcoming releases', () => {
    jest.setSystemTime(new Date('2026-12-03T08:00:00.000Z'))

    mockFetchReleasesFromStatregApi.mockReturnValueOnce([mockedReleases[2]]).mockReturnValueOnce([])

    expect(statisticsUtils.getReleaseDatesFromStatregAPI('aku')).toEqual({
      previousReleaseDate: '2026-12-02T08:00:00.000Z',
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
