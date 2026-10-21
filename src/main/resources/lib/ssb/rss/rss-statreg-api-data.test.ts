import { beforeAll, describe, expect, test } from '@jest/globals'
import { serviceUrl } from '/lib/xp/portal'
import { request } from '/lib/http-client'

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

function getService<ResponseType>(service: string, params?: Record<string, string | number>): ResponseType {
  const { status, body } = request({
    url: serviceUrl({ service, type: 'absolute', params }),
    method: 'GET',
  })

  expect(status).toBe(200)
  if (!body) throw new Error(`${service} returned an empty body`)

  return JSON.parse(body) as ResponseType
}

describe('RSS services with new Statreg source enabled', () => {
  beforeAll(() => {
    // Prerequisite: new Statreg source must be enabled
    const { features } = getService<{
      features: { _name: string; enabled: boolean }[]
    }>('features', { space: 'ssb', branch: 'master' })

    expect(
      features.some(feature =>
        feature._name === 'new-statreg-as-source' && feature.enabled
      )
    ).toBe(true)
  })

  // rssStatkal: upcoming statistical releases
  test('rssStatkal returns the expected data structure', () => {
    const items = getService<StatkalItem[]>('rssStatkal')

    expect(Array.isArray(items)).toBe(true)
    expect(items.length).toBeGreaterThan(0)

    for (const item of items) {
      expect(typeof item.guid).toBe('string')
      expect(typeof item.title).toBe('string')
      expect(typeof item.link).toBe('string')
      expect(typeof item.category).toBe('string')
      expect(typeof item.subject).toBe('string')
      expect(['no', 'en']).toContain(item.language)
      expect(typeof item.pubDate).toBe('string')
      expect(Number.isNaN(Date.parse(item.pubDate))).toBe(false)
      expect(typeof item.periode).toBe('string')
      expect(typeof item.shortname).toBe('string')
      expect(item.contacts).toEqual([])
    }
  })

  // rssNews: recent articles and statistical releases
  test('rssNews returns the expected data structure', () => {
    const items = getService<NewsItem[]>('rssNews', { days: 90 })

    expect(Array.isArray(items)).toBe(true)
    expect(items.length).toBeGreaterThan(0)

    for (const item of items) {
      expect(typeof item.guid).toBe('string')
      expect(typeof item.title).toBe('string')
      expect(typeof item.link).toBe('string')
      expect(typeof item.description).toBe('string')
      expect(typeof item.category).toBe('string')
      expect(typeof item.subject).toBe('string')
      expect(['no', 'en']).toContain(item.language)
      expect(typeof item.pubDate).toBe('string')
      expect(Number.isNaN(Date.parse(item.pubDate))).toBe(false)
      expect(typeof item.shortname).toBe('string')
    }
  })
})