import { afterAll, beforeAll, describe, expect, jest, test } from '@jest/globals'
import { StatisticInListing, VariantInListing } from '../dashboard/statreg/types'
import { findLatestRelease, formatPubDateArticle, formatPubDateStatistic } from './news-helpers'

const SUMMER_MONTH_START = 4 // April
const SUMMER_MONTH_END = 9 // September

// Mock nextReleasedPassed due to lots of dependencies and this simple implementation suffice for these tests
jest.mock('/lib/ssb/utils/variantUtils', () => ({
  nextReleasedPassed: jest.fn((variant: VariantInListing) => new Date(variant.nextRelease) <= new Date()),
}))

jest.mock('/lib/ssb/utils/serverOffset', () => ({
  getServerOffsetInMs: jest.fn(() => 0),
}))

jest.mock(
  '/lib/time',
  () => ({
    // An simplified mock implementation of formatDate from /lib/time
    formatDate: ({ date }: { date: string; pattern: string; timezoneId: string }) => {
      const date2 = new Date(date)
      const month = date2.getMonth() + 1
      // Tests assumes daylight saving time is from 1. April until 30. Sept
      const isSummer = month >= SUMMER_MONTH_START && month <= SUMMER_MONTH_END

      const offsetHours = isSummer ? 2 : 1

      const shifted = new Date(date2.getTime() + offsetHours * 3600 * 1000)

      const isoDatetime = shifted.toISOString()
      const dateTime = isoDatetime.slice(0, 19)
      return `${dateTime}+0${offsetHours}:00`
    },
  }),
  { virtual: true }
)

jest.mock(
  '../utils/dateUtils',
  () => ({
    // An simplified mock implementation for test purposes. For these testes expecting input on form "2026-01-01 08:00:00.0"
    setDateTimeAsOsloTimeZone: (dateTime: string) => {
      const [date, time] = dateTime.split(' ')
      const [year, month, day] = date.split('-')
      const [hour, minutes] = time.split(':')
      const isSummer = Number.parseInt(month) >= SUMMER_MONTH_START && Number.parseInt(month) <= SUMMER_MONTH_END
      const hoursOffset = isSummer ? 2 : 1
      const isoHours = (Number.parseInt(hour) - hoursOffset).toString()
      const isoHoursTwoDigit = isoHours.length == 2 ? isoHours : `0${isoHours}`
      return `${year}-${month}-${day}T${isoHoursTwoDigit}:${minutes}:00Z`
    },
  }),
  { virtual: true }
)

describe('rss/news-helpers ', () => {
  describe('findLatestRelease', () => {
    const realDate = Date

    beforeAll(() => {
      jest.useFakeTimers() // Enable fake timers
    })

    afterAll(() => {
      jest.useRealTimers()
      global.Date = realDate
    })
    const testCases = [
      {
        name: 'should find previous release',
        systemTime: '2025-07-01T10:00:00+0200',
        expectedDate: 'Thu Jun 26 2025',
        expectedFrekvens: 'Måned',
        expectedNextRelease: '2025-07-24 08:00:00.0',
        expectedPreviousRelease: '2025-06-26 08:00:00.0',
      },
      {
        name: 'should find previous release before release hours same day as next release',
        systemTime: '2025-07-24T04:00:00+0200',
        expectedDate: 'Thu Jun 26 2025',
        expectedFrekvens: 'Måned',
        expectedNextRelease: '2025-07-24 08:00:00.0',
        expectedPreviousRelease: '2025-06-26 08:00:00.0',
      },
      {
        name: 'should find next release when next release date passed',
        systemTime: '2025-10-24T10:00:00+0200',
        expectedDate: 'Tue Aug 12 2025',
        expectedFrekvens: 'Kvartal',
        expectedNextRelease: '2025-08-12 08:00:00.0',
        expectedPreviousRelease: '2025-05-08 08:00:00.0',
      },
    ]

    test.each(testCases)(
      '$name',
      ({ systemTime, expectedDate, expectedFrekvens, expectedNextRelease, expectedPreviousRelease }) => {
        jest.setSystemTime(new Date(systemTime))
        const { latestVariant, latestRelease } = findLatestRelease(statistic.variants!)

        expect(latestRelease.toDateString()).toBe(expectedDate)
        expect(latestVariant.frekvens).toBe(expectedFrekvens)
        expect(latestVariant.nextRelease).toBe(expectedNextRelease)
        expect(latestVariant.previousRelease).toBe(expectedPreviousRelease)
      }
    )
  })

  describe('formatPubDateStatistic ', () => {
    test('get correct pubdate for dates day wintertime pubdate', () => {
      const pubdate = formatPubDateStatistic('2026-01-01 08:00:00.0')
      expect(pubdate).toBe('2026-01-01T08:00:00+01:00')
    })
    test('get correct pubdate for dates summertime pubdate', () => {
      const pubdate = formatPubDateStatistic('2025-08-12 08:00:00.0')
      expect(pubdate).toBe('2025-08-12T08:00:00+02:00')
    })
  })

  describe('formatPubDateArticle ', () => {
    test('get correct pubdate for dates wintertime pubdate', () => {
      const pubdate = formatPubDateArticle('2025-12-17T07:00:00Z')
      expect(pubdate).toBe('2025-12-17T08:00:00+01:00')
    })
    test('get correct pubdate for dates day summertime pubdate', () => {
      const pubdate = formatPubDateArticle('2025-06-06T06:00:00Z')
      expect(pubdate).toBe('2025-06-06T08:00:00+02:00')
    })
  })
})

// MOCK DATA
const statistic: StatisticInListing = {
  id: 4202,
  shortName: 'aku',
  name: 'Arbeidskraftundersøkelsen ',
  nameEN: 'Labour force survey',
  modifiedTime: '2024-07-02 11:23:09.753',
  status: 'A',
  variants: [
    {
      id: '7841',
      frekvens: 'Kvartal',
      previousRelease: '2025-05-08 08:00:00.0',
      previousFrom: '2025-01-01 00:00:00.0',
      previousTo: '2025-03-31 00:00:00.0',
      nextRelease: '2025-08-12 08:00:00.0',
      nextReleaseId: '200562',
      upcomingReleases: [],
    },
    {
      id: '180006',
      frekvens: 'Måned',
      previousRelease: '2025-06-26 08:00:00.0',
      previousFrom: '2025-05-01 00:00:00.0',
      previousTo: '2025-05-31 00:00:00.0',
      nextRelease: '2025-07-24 08:00:00.0',
      nextReleaseId: '200532',
      upcomingReleases: [],
    },
  ],
}
