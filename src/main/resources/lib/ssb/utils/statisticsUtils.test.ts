import { afterAll, beforeAll, beforeEach, describe, expect, jest, test } from '@jest/globals'

const mockFetchReleasesFromStatregApi = jest.fn()
const mockLog = {
  info: jest.fn(),
  error: jest.fn(),
  warning: jest.fn(),
}

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

jest.mock('/lib/ssb/utils/serverOffset', () => ({
  getServerOffsetInMs: jest.fn(() => 0),
}))

jest.mock('/lib/ssb/statreg/statistics', () => ({
  __esModule: true,
  fetchReleasesFromStatregApi: (...args: unknown[]) => mockFetchReleasesFromStatregApi(...args),
  getReleaseDatesByVariants: jest.fn(),
}))

import * as statisticsUtils from './statisticsUtils'

beforeAll(() => {
  jest.useFakeTimers()
})

afterAll(() => {
  jest.useRealTimers()
})

beforeEach(() => {
  mockFetchReleasesFromStatregApi.mockReset()
  mockFetchReleasesFromStatregApi.mockReturnValue(releases)
  ;(globalThis as { app?: { config?: Record<string, string> } }).app = { config: {} }
  ;(globalThis as { log?: typeof mockLog }).log = mockLog
})

const releases = [
  { publish_time: '2026-10-02T08:00:00.000Z' },
  { publish_time: '2026-11-02T08:00:00.000Z' },
  { publish_time: '2026-12-02T08:00:00.000Z' },
]

describe('getReleaseDatesFromStatregAPI', () => {
  test('keeps the 08:00 release as upcoming one second before publish time', () => {
    jest.setSystemTime(new Date('2026-10-02T07:59:59.000Z'))

    expect(statisticsUtils.getReleaseDatesFromStatregAPI('aku')).toEqual({
      previousReleaseDate: '',
      nextReleaseDate: '2026-10-02T08:00:00.000Z',
      previewNextReleaseDate: '2026-11-02T08:00:00.000Z',
    })
  })

  test('moves the 08:00 release to previous exactly at publish time', () => {
    jest.setSystemTime(new Date('2026-10-02T08:00:00.000Z'))

    expect(statisticsUtils.getReleaseDatesFromStatregAPI('aku')).toEqual({
      previousReleaseDate: '2026-10-02T08:00:00.000Z',
      nextReleaseDate: '2026-11-02T08:00:00.000Z',
      previewNextReleaseDate: '2026-12-02T08:00:00.000Z',
    })
    expect(mockFetchReleasesFromStatregApi).toHaveBeenCalledWith({
      shortname: 'aku',
      sort: 'publish_time',
      approval_status: 'GODKJENT',
    })
  })
})

describe('getStatisticsDates', () => {
  const phrases = {
    notAvailable: 'Not available',
    notYetDetermined: 'Not yet determined',
  }

  const statisticsContent = {
    language: 'en',
    data: {
      shortname: 'aku',
    },
  }

  test('formats StatReg API dates through the shared helper at the 08:00 boundary', () => {
    jest.setSystemTime(new Date('2026-10-02T08:00:00.000Z'))

    expect(
      statisticsUtils.getStatisticsDates(statisticsContent as never, phrases as never, false, undefined, true)
    ).toEqual({
      changeDate: undefined,
      previousRelease: '2 October 2026',
      nextRelease: '2 November 2026',
    })

    expect(
      statisticsUtils.getStatisticsDates(statisticsContent as never, phrases as never, true, undefined, true)
    ).toEqual({
      changeDate: undefined,
      previousRelease: '2 November 2026',
      nextRelease: '2 December 2026',
    })
  })
})
