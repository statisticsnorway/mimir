import { afterAll, beforeAll, describe, expect, jest, test } from '@jest/globals'
import { firstReleaseOfEach } from './statkal'

describe('statkal helper functions', () => {
  describe('firstReleaseOfEach', () => {
    const filteredReleases = firstReleaseOfEach(dummyReleases)
    expect(filteredReleases).toHaveLength(3)
  })
})

const dummyReleases = [
  {
    id: 189796,
    publish_time: '2028-06-15T06:00:00.000Z',
    approval_status: 'GODKJENT',
    period_to: '2027-12-31',
    period_from: '2027-01-01',
    measuring_period: {
      title: '2027',
      title_en: '2027',
    },
    statistic: {
      id: 45050,
      shortname: 'kostrahoved',
      name: 'KOSTRA',
      name_en: 'KOSTRA',
    },
    frequency: {
      name: 'År',
      code: 'A',
    },
    revision: {
      code: 'R',
    },
  },
  {
    id: 189781,
    publish_time: '2028-03-15T07:00:00.000Z',
    approval_status: 'GODKJENT',
    period_to: '2027-12-31',
    period_from: '2027-01-01',
    measuring_period: {
      title: '2027',
      title_en: '2027',
    },
    statistic: {
      id: 45050,
      shortname: 'kostrahoved',
      name: 'KOSTRA',
      name_en: 'KOSTRA',
    },
    frequency: {
      name: 'År',
      code: 'A',
    },
    revision: {
      code: 'F',
    },
  },
  {
    id: 200890,
    publish_time: '2027-07-15T06:00:00.000Z',
    approval_status: 'GODKJENT',
    period_to: '2026-12-31',
    period_from: '2026-01-01',
    measuring_period: {
      title: '2026',
      title_en: '2026',
    },
    statistic: {
      id: 5565,
      shortname: 'kommregnfy',
      name: 'Fylkeskommuneregnskap',
      name_en: 'County authority accounts',
    },
    frequency: {
      name: 'År',
      code: 'A',
    },
    revision: {
      code: 'I',
    },
  },
  {
    id: 200930,
    publish_time: '2027-06-15T06:00:00.000Z',
    approval_status: 'GODKJENT',
    period_to: '2026-12-31',
    period_from: '2026-01-01',
    measuring_period: {
      title: '2026',
      title_en: '2026',
    },
    statistic: {
      id: 5565,
      shortname: 'kommregnfy',
      name: 'Fylkeskommuneregnskap',
      name_en: 'County authority accounts',
    },
    frequency: {
      name: 'År',
      code: 'A',
    },
    revision: {
      code: 'I',
    },
  },
]
