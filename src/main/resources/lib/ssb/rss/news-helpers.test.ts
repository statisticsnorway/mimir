import { afterAll, beforeAll, describe, expect, jest, test } from '@jest/globals'
import { StatisticInListing, VariantInListing } from '../dashboard/statreg/types'
import { findLatestRelease } from './news-helpers'

// Mock nextReleasedPassed due to lots of dependencies and this simple implementation suffice for these tests
jest.mock('/lib/ssb/utils/variantUtils', () => ({
  nextReleasedPassed: jest.fn((variant: VariantInListing) => new Date(variant.nextRelease) <= new Date()),
}))

jest.mock('/lib/ssb/utils/serverOffset', () => ({
  getServerOffsetInMs: jest.fn(() => 0),
}))

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
