import { Content } from '/lib/xp/content'
import { Region } from '/lib/xp/portal'
import { type Page } from '/site/content-types'
import { type Default as DefaultPageConfig } from '/site/pages/default'

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
