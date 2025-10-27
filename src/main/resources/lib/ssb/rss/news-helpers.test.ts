import { afterAll, beforeAll, describe, expect, jest, test } from '@jest/globals'
import { StatisticInListing, VariantInListing } from '../dashboard/statreg/types'
import { findLatestRelease } from './news-helpers'

// Mock nextReleasedPassed due to lots of dependencies and this simple implementation suffice for these tests
jest.mock('/lib/ssb/utils/variantUtils', () => ({
  nextReleasedPassed: jest.fn((variant: VariantInListing) => new Date(variant.nextRelease) <= new Date()),
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

  test('should find previous release', () => {
    jest.setSystemTime(new Date('2025-07-01T10:00:00Z'))
    const { latestVariant, latestRelease } = findLatestRelease(statistic.variants!)

    expect(latestRelease.toString()).toBe('Thu Jun 26 2025 08:00:00 GMT+0200 (Central European Summer Time)')
    expect(latestVariant.frekvens).toBe('Måned')
    expect(latestVariant.nextRelease).toBe('2025-07-24 08:00:00.0')
    expect(latestVariant.previousRelease).toBe('2025-06-26 08:00:00.0')
  })

  test('should find previous release before release hours same day as next release', () => {
    jest.setSystemTime(new Date('2025-07-24T04:00:00Z'))
    const { latestVariant, latestRelease } = findLatestRelease(statistic.variants!)

    expect(latestRelease.toString()).toBe('Thu Jun 26 2025 08:00:00 GMT+0200 (Central European Summer Time)')
    expect(latestVariant.frekvens).toBe('Måned')
    expect(latestVariant.nextRelease).toBe('2025-07-24 08:00:00.0')
    expect(latestVariant.previousRelease).toBe('2025-06-26 08:00:00.0')
  })

  test('should find next release when next release date passed', () => {
    jest.setSystemTime(new Date('2025-10-24T10:00:00Z'))
    const { latestVariant, latestRelease } = findLatestRelease(statistic.variants!)

    expect(latestRelease.toString()).toBe('Tue Aug 12 2025 08:00:00 GMT+0200 (Central European Summer Time)')
    expect(latestVariant.frekvens).toBe('Kvartal')
    expect(latestVariant.nextRelease).toBe('2025-08-12 08:00:00.0')
    expect(latestVariant.previousRelease).toBe('2025-05-08 08:00:00.0')
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
      upcomingReleases: [
        {
          id: '200562',
          publishTime: '2025-08-12 08:00:00.0',
          periodFrom: '2025-04-01 00:00:00.0',
          periodTo: '2025-06-30 00:00:00.0',
        },
      ],
    },
    {
      id: '180005',
      frekvens: 'År',
      previousRelease: '2025-02-10 08:00:00.0',
      previousFrom: '2024-01-01 00:00:00.0',
      previousTo: '2024-12-31 00:00:00.0',
      nextRelease: '2026-02-11 08:00:00.0',
      nextReleaseId: '200565',
      upcomingReleases: [
        {
          id: '200565',
          publishTime: '2026-02-11 08:00:00.0',
          periodFrom: '2025-01-01 00:00:00.0',
          periodTo: '2025-12-31 00:00:00.0',
        },
      ],
    },
    {
      id: '180006',
      frekvens: 'Måned',
      previousRelease: '2025-06-26 08:00:00.0',
      previousFrom: '2025-05-01 00:00:00.0',
      previousTo: '2025-05-31 00:00:00.0',
      nextRelease: '2025-07-24 08:00:00.0',
      nextReleaseId: '200532',
      upcomingReleases: [
        {
          id: '200555',
          publishTime: '2025-10-23 08:00:00.0',
          periodFrom: '2025-09-01 00:00:00.0',
          periodTo: '2025-09-30 00:00:00.0',
        },
        {
          id: '200556',
          publishTime: '2025-11-27 08:00:00.0',
          periodFrom: '2025-10-01 00:00:00.0',
          periodTo: '2025-10-31 00:00:00.0',
        },
        {
          id: '200542',
          publishTime: '2025-12-22 08:00:00.0',
          periodFrom: '2025-11-01 00:00:00.0',
          periodTo: '2025-11-30 00:00:00.0',
        },
      ],
    },
  ],
}
