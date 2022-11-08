import type { Page } from '../../site/content-types'
import { Content } from '/lib/xp/content'
import { DefaultPageConfig } from '../../site/pages/default/default-page-config'
import { Region } from '*/lib/xp/portal'
import { SEO } from '../../services/news/news'

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
