import { afterAll, beforeAll, beforeEach, describe, expect, jest, test } from '@jest/globals'

const mockFetchReleasesFromStatregApi = jest.fn()

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

import { getReleaseDatesFromStatregAPI } from './statisticsUtils'

describe('getReleaseDatesFromStatregAPI', () => {
  const releases = [
    { publish_time: '2026-10-02T08:00:00.000Z' },
    { publish_time: '2026-11-02T08:00:00.000Z' },
    { publish_time: '2026-12-02T08:00:00.000Z' },
  ]

  beforeAll(() => {
    jest.useFakeTimers()
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  beforeEach(() => {
    mockFetchReleasesFromStatregApi.mockReset()
    mockFetchReleasesFromStatregApi.mockReturnValue(releases)
  })

  test('keeps the 08:00 release as upcoming one second before publish time', () => {
    jest.setSystemTime(new Date('2026-10-02T07:59:59.000Z'))

    expect(getReleaseDatesFromStatregAPI('aku')).toEqual({
      previousReleaseDate: '',
      nextReleaseDate: '2026-10-02T08:00:00.000Z',
      previewNextReleaseDate: '2026-11-02T08:00:00.000Z',
    })
  })

  test('moves the 08:00 release to previous exactly at publish time', () => {
    jest.setSystemTime(new Date('2026-10-02T08:00:00.000Z'))

    expect(getReleaseDatesFromStatregAPI('aku')).toEqual({
      previousReleaseDate: '2026-10-02T08:00:00.000Z',
      nextReleaseDate: '2026-11-02T08:00:00.000Z',
      previewNextReleaseDate: '2026-12-02T08:00:00.000Z',
    })
    expect(mockFetchReleasesFromStatregApi).toHaveBeenCalledWith({
      shortname: 'aku',
      approval_status: 'GODKJENT',
    })
  })
})
