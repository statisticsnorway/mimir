import { describe, expect, test } from '@jest/globals'
import { execFileSync } from 'node:child_process'

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

// Check the toggle before Jest registers tests, using Node's built-in fetch.
const statregEnabled = execFileSync(
  process.execPath,
  [
    '-e',
    `
      (async () => {
        const response = await fetch(process.argv[1])
        if (!response.ok) {
          throw new Error('Feature toggle request failed: ' + response.status)
        }

        const { features } = await response.json()
        const enabled = features.some(
          feature =>
            feature._name === 'new-statreg-as-source' &&
            feature.enabled
        )

        process.stdout.write(String(enabled))
      })().catch(error => {
        console.error(error)
        process.exit(1)
      })
    `,
    `${baseUrl}/_/service/mimir/features?space=ssb&branch=master`,
  ],
  { encoding: 'utf8', timeout: 10000 }
).trim() === 'true'

const rssTest = statregEnabled ? test : test.skip
const skipReason = statregEnabled
  ? ''
  : ' (SKIPPED: new-statreg-as-source feature toggle is OFF)'

describe('RSS services with new Statreg source enabled', () => {

  // rssStatkal: validates upcoming releases and compares them with known Statreg data.
  rssTest(`rssStatkal returns the expected data structure${skipReason}`, async () => {
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
  rssTest(`rssNews returns the expected data structure${skipReason}`, async () => {
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