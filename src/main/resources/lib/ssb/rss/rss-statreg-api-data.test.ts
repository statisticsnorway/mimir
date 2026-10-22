import { beforeAll, describe, expect, test } from '@jest/globals'

type StatkalItem = {
  guid: string
  title: string
  link: string
  description?: string
  category: string
  subject: string
  language: 'no' | 'en'
  pubDate: string
  periode: string
  shortname: string
  contacts: unknown[]
}

type NewsItem = {
  guid: string
  title: string
  link: string
  description: string
  category: string
  subject: string
  language: 'no' | 'en'
  pubDate: string
  shortname: string
}

// Fixed reference data from the new Statreg-based RSS Statkal response.
const mockStatkal = [
  {
    guid: '210210',
    title: 'Byggeareal',
    language: 'no',
    pubDate: '2027-01-19T07:00:00.000Z',
    periode: 'Tall for 4. kvartal 2026',
    shortname: 'byggeareal',
    contacts: [],
  },
  {
    guid: '207792',
    title: 'Arbeidskraftundersøkelsen',
    language: 'no',
    pubDate: '2026-12-22T07:00:00.000Z',
    periode: 'Tall for november 2026',
    shortname: 'aku',
    contacts: [],
  },
] satisfies Partial<StatkalItem>[]

// Fixed reference data from the new RSS News response.
const mockNews = [
  {
    guid: '8c671278-7749-4693-b781-fe6e69ab24b4',
    title: 'Visualisering av befolkningsframskrivinger for kommunene',
    language: 'no',
    shortname: '',
  },
  {
    guid: '080d0ed5-822c-448f-b7db-6e45b6c989ef',
    title: 'Arbeidskraftundersøkelsen',
    language: 'no',
    shortname: 'aku',
  },
] satisfies Partial<NewsItem>[]

const baseUrl =
  (typeof app !== 'undefined' && app.config?.['ssb.internal.baseUrl']) ||
  'http://localhost:8080'

// Fetches JSON from a Mimir service and verifies that the request succeeds.
async function getService<ResponseType>(service: string): Promise<ResponseType> {
  const response = await fetch(`${baseUrl}/_/service/mimir/${service}`)
  expect(response.status).toBe(200)
  return response.json() as Promise<ResponseType>
}

// Validates shared RSS field types, supported languages, and publication dates.
function expectCommonFields(item: StatkalItem | NewsItem) {
  for (const field of [
    'guid', 'title', 'link', 'category', 'subject', 'pubDate', 'shortname'
  ] as const) {
    expect(typeof item[field]).toBe('string')
  }

  expect(['no', 'en']).toContain(item.language)
  expect(Number.isNaN(Date.parse(item.pubDate))).toBe(false)
}

// Finds matching RSS items by GUID and language and compares them with reference data.
function expectMockData<T extends StatkalItem | NewsItem>(
  items: T[],
  mocks: Partial<T>[]
) {
  for (const expected of mocks) {
    const actual = items.find(
      item => item.guid === expected.guid &&
        item.language === expected.language
    )

    if (actual) {
      expect(actual).toMatchObject(expected)
    }
  }
}

describe('RSS services with new Statreg source enabled', () => {
  let statregEnabled = false

  // Checks whether the new Statreg source is enabled before running RSS validations.
  beforeAll(async () => {
    const { features } = await getService<{
      features: { _name: string; enabled: boolean }[]
    }>('features?space=ssb&branch=master')

    statregEnabled = features.some(
      feature =>
        feature._name === 'new-statreg-as-source' &&
        feature.enabled
    )
  })

  // rssStatkal: validates upcoming releases and compares them with known Statreg data.
  test('rssStatkal returns the expected data structure', async () => {
    if (!statregEnabled) return

    const items = await getService<StatkalItem[]>('rssStatkal')

    expect(Array.isArray(items)).toBe(true)
    expect(items.length).toBeGreaterThan(0)

    for (const item of items) {
      expectCommonFields(item)
      expect(typeof item.periode).toBe('string')
      expect(item.contacts).toEqual([])
    }

    expectMockData(items, mockStatkal)
  })

  // rssNews: validates recent news and compares them with known reference data.
  test('rssNews returns the expected data structure', async () => {
    if (!statregEnabled) return

    const items = await getService<NewsItem[]>('rssNews?days=90')

    expect(Array.isArray(items)).toBe(true)
    expect(items.length).toBeGreaterThan(0)

    for (const item of items) {
      expectCommonFields(item)
      expect(typeof item.description).toBe('string')
    }

    expectMockData(items, mockNews)
  })
})