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

const baseUrl = (typeof app !== 'undefined' && app.config?.['ssb.internal.baseUrl']) || 'http://localhost:8080'

async function getService<ResponseType>(service: string): Promise<ResponseType> {
  const response = await fetch(`${baseUrl}/_/service/mimir/${service}`)
  expect(response.status).toBe(200)
  return response.json() as Promise<ResponseType>
}

function expectCommonFields(item: StatkalItem | NewsItem) {
  for (const field of ['guid', 'title', 'link', 'category', 'subject', 'pubDate', 'shortname'] as const) {
    expect(typeof item[field]).toBe('string')
  }

  expect(['no', 'en']).toContain(item.language)
  expect(Number.isNaN(Date.parse(item.pubDate))).toBe(false)
}

// Both RSS tests require new-statreg-as-source to be enabled
describe('RSS services with new Statreg source enabled', () => {
  beforeAll(async () => {
    const { features } = await getService<{
      features: { _name: string; enabled: boolean }[]
    }>('features?space=ssb&branch=master')

    expect(
      features.some(feature =>
        feature._name === 'new-statreg-as-source' && feature.enabled
      )
    ).toBe(true)
  })

  // rssStatkal: upcoming statistical releases
  test('rssStatkal returns the expected data structure', async () => {
    const items = await getService<StatkalItem[]>('rssStatkal')

    expect(Array.isArray(items)).toBe(true)
    expect(items.length).toBeGreaterThan(0)

    for (const item of items) {
      expectCommonFields(item)
      expect(typeof item.periode).toBe('string')
      expect(item.contacts).toEqual([])
    }
  })

  // rssNews: recent articles and statistical releases
  test('rssNews returns the expected data structure', async () => {
    const items = await getService<NewsItem[]>('rssNews?days=90')

    expect(Array.isArray(items)).toBe(true)
    expect(items.length).toBeGreaterThan(0)

    for (const item of items) {
      expectCommonFields(item)
      expect(typeof item.description).toBe('string')
    }
  })
})