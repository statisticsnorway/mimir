import { serviceUrl } from '/lib/xp/portal'
import { request } from '/lib/http-client'
import { isEnabled } from '/lib/featureToggle'

export type StatkalItem = {
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

export type NewsItem = {
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

export function isStatregEnabled(): boolean {
  return isEnabled('new-statreg-as-source', false, 'ssb')
}

export function getService<ResponseType>(service: string, params?: Record<string, string | number>): ResponseType {
  const baseUrl = app.config?.['ssb.internal.baseUrl'] || 'http://localhost:8080'

  const { status, body } = request({
    url: `${baseUrl}${serviceUrl({ service, params })}`,
    method: 'GET',
  })

  if (status !== 200) throw new Error(`${service} returned ${status}`)
  if (!body) throw new Error(`${service} returned an empty body`)

  return JSON.parse(body) as ResponseType
}
