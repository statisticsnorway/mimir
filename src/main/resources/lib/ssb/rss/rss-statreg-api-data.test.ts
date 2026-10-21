
import { beforeAll, describe, expect, test } from '@jest/globals'

const baseUrl = 'https://www.qa.ssb.no/_/service/mimir'

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

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${baseUrl}/${path}`)
  expect(response.status).toBe(200)
  return response.json() as Promise<T>
}

function expectCommonFields(item: StatkalItem | NewsItem) {
  expect(typeof item.guid).toBe('string')
  expect(typeof item.title).toBe('string')
  expect(typeof item.link).toBe('string')
  expect(typeof item.category).toBe('string')
  expect(typeof item.subject).toBe('string')
  expect(['no', 'en']).toContain(item.language)
  expect(typeof item.pubDate).toBe('string')
  expect(Number.isNaN(Date.parse(item.pubDate))).toBe(false)
  expect(item.link.startsWith('https://www.qa.ssb.no/en/')).toBe(item.language === 'en')
}

describe('RSS services with new Statreg source enabled', () => {
  beforeAll(async () => {
    const { features } = await get<{
      features: Array<{ _name: string; enabled: boolean }>
    }>('features?space=ssb&branch=master')

    expect(
      features.find((feature) => feature._name === 'new-statreg-as-source')?.enabled
    ).toBe(true)
  })

  // rssStatkal: upcoming statistical releases
  test('rssStatkal returns the expected data structure', async () => {
    const items = await get<StatkalItem[]>('rssStatkal')

    expect(Array.isArray(items)).toBe(true)

    for (const item of items) {
      expectCommonFields(item)
      expect(typeof item.periode).toBe('string')
      expect(typeof item.shortname).toBe('string')
      expect(item.contacts).toEqual([])
    }
  })

  // rssNews: recent articles and statistical releases
  test('rssNews returns the expected data structure', async () => {
    const items = await get<NewsItem[]>('rssNews?days=90')

    expect(Array.isArray(items)).toBe(true)

    for (const item of items) {
      expectCommonFields(item)
      expect(typeof item.description).toBe('string')
      expect(typeof item.shortname).toBe('string')
    }
  })
})
