import type { Page } from '/site/content-types'
import { Content } from '/lib/xp/content'
import type { Default as DefaultPageConfig } from '/site/pages/default'
import { Region } from '*/lib/xp/portal'
import { SEO } from 'src/main/resources/services/news/news'

export interface DefaultPage extends Content<Page, SEO> {
  page: {
    readonly path: string
    readonly type: string
    readonly descriptor: string
    readonly regions?: Record<string, Region>
    config: DefaultPageConfig
    data: {
      ingress: string
      keywords: string
      statistic: string
      subtopic: Array<string>
      articleType: string
    }
  }
}
