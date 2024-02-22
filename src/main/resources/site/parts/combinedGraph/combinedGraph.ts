import { get as getContentByKey, type Content } from '/lib/xp/content'
import { getComponent, getContent } from '/lib/xp/portal'
import { localize } from '/lib/xp/i18n'
import { type HighchartsGraphConfig } from '/lib/types/highcharts'
import { render } from '/lib/thymeleaf'
import { scriptAsset } from '/lib/ssb/utils/utils'
import { forceArray } from '/lib/ssb/utils/arrayUtils'
import { createCombinedGraphConfig } from '/lib/ssb/parts/highcharts/highchartsUtils'
import { renderError } from '/lib/ssb/error/error'
import { type CombinedGraph } from '/site/content-types'

const view = resolve('./combinedGraph.html')

export function get(req: XP.Request): XP.Response {
  try {
    const part = getComponent<XP.PartComponent.CombinedGraph>()
    if (!part) throw Error('No part found')

    const highchartIds: Array<string> = part.config.combinedGraph ? forceArray(part.config.combinedGraph) : []
    return renderPart(req, highchartIds)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request, id: string): XP.Response {
  try {
    return renderPart(req, [id])
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

function renderPart(req: XP.Request, highchartIds: Array<string>): XP.Response {
  log.info('\x1b[32m%s\x1b[0m', '1. renderPart CombinedGraph')
  const page = getContent()
  if (!page) throw Error('No page found')

  const language: string = page.language ? page.language : 'nb'

  //  Must be set to nb instead of no for localization
  const sourceText: string = localize({
    key: 'highcharts.source',
    locale: language === 'nb' ? 'no' : language,
  })
  const downloadText: string = localize({
    key: 'highcharts.download',
    locale: language === 'nb' ? 'no' : language,
  })

  const showAsGraphText: string = localize({
    key: 'highcharts.showAsChart',
    locale: language === 'nb' ? 'no' : language,
  })

  const showAsTableText: string = localize({
    key: 'highcharts.showAsTable',
    locale: language === 'nb' ? 'no' : language,
  })

  const highcharts: Array<HighchartsProps> = highchartIds
    .map((key) => {
      const highchart: Content<CombinedGraph> | null = getContentByKey({
        key,
      })
      const config: HighchartsGraphConfig | undefined = highchart ? createCombinedGraphConfig(highchart) : undefined
      return highchart && config ? createHighchartsProps(highchart, config) : {}
    })
    .filter((key) => !!key)

  const inlineScript: Array<string> = highcharts.map(
    (highchart) => `<script type="text/javascript">
   window['highchart' + '${highchart.contentKey}'] = ${JSON.stringify(highchart.config)}
   </script>`
  )

  return {
    body: render(view, {
      highcharts,
      downloadText,
      sourceText,
      showAsGraphText,
      showAsTableText,
    }),
    pageContributions: {
      bodyEnd: [...inlineScript, scriptAsset('js/highchart.js')],
    },
    contentType: 'text/html',
  }
}

function createHighchartsProps(highchart: Content<CombinedGraph>, config: HighchartsGraphConfig): HighchartsProps {
  return {
    config: config,
    contentKey: highchart._id,
    footnoteText: highchart.data.footnoteText ? forceArray(highchart.data.footnoteText) : undefined,
    creditsEnabled: highchart.data.sourceList ? true : false,
    sourceList: highchart.data.sourceList ? forceArray(highchart.data.sourceList) : undefined,
  }
}

interface HighchartsProps {
  config?: HighchartsGraphConfig
  description?: string
  contentKey?: string
  footnoteText?: string[]
  creditsEnabled?: boolean
  sourceList?: CombinedGraph['sourceList']
}
