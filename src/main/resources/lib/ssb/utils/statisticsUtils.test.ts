import { afterAll, beforeAll, beforeEach, describe, expect, jest, test } from '@jest/globals'
import * as dateUtils from './dateUtils'
import * as statisticsUtils from './statisticsUtils'

jest.mock('/lib/time', () => ({ formatDate: jest.fn() }), { virtual: true })

const mockFetchReleasesFromStatregApi = jest.fn()
const mockSetDateTimeAsOsloTimeZone = jest.spyOn(dateUtils, 'setDateTimeAsOsloTimeZone')

jest.mock('/lib/ssb/statreg/statistics', () => ({
  fetchReleasesFromStatregApi: (...args: unknown[]) => mockFetchReleasesFromStatregApi(...args),
}))

beforeAll(() => {
  jest.useFakeTimers()
})

afterAll(() => {
  mockSetDateTimeAsOsloTimeZone.mockRestore()
  jest.useRealTimers()
})

beforeEach(() => {
  mockFetchReleasesFromStatregApi.mockReset()
  mockSetDateTimeAsOsloTimeZone.mockReset()
  ;(globalThis as { app?: { config?: Record<string, string> } }).app = { config: {} }
})

const mockedReleases = [
  { publish_time: '2026-10-02T08:00:00.000+02:00' },
  { publish_time: '2026-11-02T08:00:00.000+01:00' },
  { publish_time: '2026-12-02T08:00:00.000+01:00' },
]

describe('getReleaseDatesFromStatregAPI', () => {
  const timeCases = [
    {
      season: 'summer',
      date: '2026-10-02',
      offset: '+02:00',
      cutoffBefore: '2026-10-02T05:59:59.000Z',
      cutoffAt: '2026-10-02T06:00:00.000Z',
      releaseIndex: 0,
    },
    {
      season: 'winter',
      date: '2026-11-02',
      offset: '+01:00',
      cutoffBefore: '2026-11-02T06:59:59.000Z',
      cutoffAt: '2026-11-02T07:00:00.000Z',
      releaseIndex: 1,
    },
  ]

  test.each(timeCases)(
    'keeps the 08:00 Oslo release as upcoming one second before publish time in $season time',
    ({ date, offset, cutoffBefore, releaseIndex }) => {
      const now = `${date}T07:59:59.000Z`
      jest.setSystemTime(new Date(now))
      mockSetDateTimeAsOsloTimeZone.mockReturnValueOnce(`${date}T07:59:59.000${offset}`)

      mockFetchReleasesFromStatregApi
        .mockReturnValueOnce([])
        .mockReturnValueOnce([mockedReleases[releaseIndex], mockedReleases[releaseIndex + 1]])

      expect(statisticsUtils.getReleaseDatesFromStatregAPI('aku')).toEqual({
        previousReleaseDate: '',
        nextReleaseDate: mockedReleases[releaseIndex].publish_time,
        previewNextReleaseDate: mockedReleases[releaseIndex + 1].publish_time,
      })
      expect(mockSetDateTimeAsOsloTimeZone).toHaveBeenCalledWith(now)
      expect(mockFetchReleasesFromStatregApi).toHaveBeenNthCalledWith(1, {
        count: 1,
        shortname: 'aku',
        sort: '-publish_time',
        approval_status: 'GODKJENT',
        publish_time_before: cutoffBefore,
      })
      expect(mockFetchReleasesFromStatregApi).toHaveBeenNthCalledWith(2, {
        count: 2,
        shortname: 'aku',
        sort: 'publish_time',
        approval_status: 'GODKJENT',
        publish_time_after: cutoffBefore,
      })
    }
  )

  test.each(timeCases)(
    'moves the 08:00 Oslo release to previous exactly at publish time in $season time',
    ({ date, offset, cutoffAt, releaseIndex }) => {
      const now = `${date}T08:00:00.000Z`
      jest.setSystemTime(new Date(now))
      mockSetDateTimeAsOsloTimeZone.mockReturnValueOnce(`${date}T08:00:00.000${offset}`)

      mockFetchReleasesFromStatregApi
        .mockReturnValueOnce([mockedReleases[releaseIndex]])
        .mockReturnValueOnce(mockedReleases.slice(releaseIndex + 1))

      expect(statisticsUtils.getReleaseDatesFromStatregAPI('aku')).toEqual({
        previousReleaseDate: mockedReleases[releaseIndex].publish_time,
        nextReleaseDate: mockedReleases[releaseIndex + 1].publish_time,
        previewNextReleaseDate: mockedReleases[releaseIndex + 2]?.publish_time ?? '',
      })
      expect(mockSetDateTimeAsOsloTimeZone).toHaveBeenCalledWith(now)
      expect(mockFetchReleasesFromStatregApi).toHaveBeenNthCalledWith(1, {
        count: 1,
        shortname: 'aku',
        sort: '-publish_time',
        approval_status: 'GODKJENT',
        publish_time_before: cutoffAt,
      })
      expect(mockFetchReleasesFromStatregApi).toHaveBeenNthCalledWith(2, {
        count: 2,
        shortname: 'aku',
        sort: 'publish_time',
        approval_status: 'GODKJENT',
        publish_time_after: cutoffAt,
      })
    }
  )

  test('returns previous release even when there are no upcoming releases', () => {
    jest.setSystemTime(new Date('2026-12-03T08:00:00.000Z'))
    mockSetDateTimeAsOsloTimeZone.mockReturnValueOnce('2026-12-03T08:00:00.000+01:00')

    mockFetchReleasesFromStatregApi.mockReturnValueOnce([mockedReleases[2]]).mockReturnValueOnce([])

    expect(statisticsUtils.getReleaseDatesFromStatregAPI('aku')).toEqual({
      previousReleaseDate: mockedReleases[2].publish_time,
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

  test('formats StatReg API dates through the shared helper at the 08:00 Oslo boundary', () => {
    jest.setSystemTime(new Date('2026-10-02T08:00:00.000Z'))
    mockSetDateTimeAsOsloTimeZone.mockReturnValueOnce('2026-10-02T08:00:00.000+02:00')

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

  test('formats draft StatReg API dates in English at the 08:00 Oslo boundary', () => {
    jest.setSystemTime(new Date('2026-10-02T08:00:00.000Z'))
    mockSetDateTimeAsOsloTimeZone.mockReturnValueOnce('2026-10-02T08:00:00.000+02:00')

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
