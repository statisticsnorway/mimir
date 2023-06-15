import type { Page } from '/site/content-types'
import { Content } from '/lib/xp/content'
import type { Default as DefaultPageConfig } from '/site/pages/default'
import { Region } from '/lib/xp/portal'

export interface DefaultPage extends Content<Page> {
  page: {
    readonly path: string
    readonly type: 'page' | 'layout' | 'part'
    readonly descriptor: string
    readonly regions: Record<string, Region<object>>
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
