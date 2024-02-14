// @ts-ignore
import { get as getContentByKey, type Content } from '/lib/xp/content'
import { getComponent, getContent } from '/lib/xp/portal'
import { localize } from '/lib/xp/i18n'
import { type HighchartsGraphConfig } from '/lib/types/highcharts'
import { render } from '/lib/thymeleaf'
import { render as r4XpRender } from '/lib/enonic/react4xp'
import { scriptAsset } from '/lib/ssb/utils/utils'

import * as util from '/lib/util'
import { createCombinedGraphObject } from '/lib/ssb/parts/highcharts/highchartsUtils'
import { renderError } from '/lib/ssb/error/error'
import { isEnabled } from '/lib/featureToggle'
import { getPhrases } from '/lib/ssb/utils/language'
import { GA_TRACKING_ID } from '/site/pages/default/default'
import { type DataSource } from '/site/mixins/dataSource'
import { type CombinedGraph } from '/site/content-types'

const view = resolve('./combinedGraph.html')

export function get(req: XP.Request): XP.Response {
  try {
    const part = getComponent<XP.PartComponent.CombinedGraph>()
    if (!part) throw Error('No part found')

    const highchartIds: Array<string> = part.config.combinedGraph ? util.data.forceArray(part.config.combinedGraph) : []
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

  const highcharts: Array<HighchartsReactProps> = highchartIds
    .map((key) => {
      const highchart: Content<CombinedGraph & DataSource> | null = getContentByKey({
        key,
      })
      const config: HighchartsExtendedProps | undefined = highchart ? determinConfigType(req, highchart) : undefined
      return highchart && config ? createHighchartsReactProps(highchart, config) : {}
    })
    .filter((key) => !!key)

  const inlineScript: Array<string> = highcharts.map(
    (highchart) => `<script type="text/javascript">
   window['highchart' + '${highchart.contentKey}'] = ${JSON.stringify(highchart.config)}
   </script>`
  )

  //log.info('\x1b[36m%s\x1b[0m', 'combinedGraphs: ' + JSON.stringify(highcharts, null, 2))

  const HighchartProps: object = {
    highcharts,
    phrases: getPhrases(page),
    appName: app.name,
    pageType: page.type,
    GA_TRACKING_ID: GA_TRACKING_ID,
  }

  if (isEnabled('highchart-react', true, 'ssb')) {
    // R4xp disables hydration in edit mode, but highcharts need hydration to show
    // we sneaky swap mode since we want a render of higchart in edit mode
    const _req = req
    if (req.mode === 'edit') _req.mode = 'preview'

    return r4XpRender('site/parts/highchart/Highchart', HighchartProps, _req, {
      body: '<section class="xp-part highchart-wrapper"></section>',
    })
  } else {
    return {
      body: render(view, {
        highcharts,
        downloadText,
        sourceText,
        showDataTableEnabled: isEnabled('highchart-show-datatable', false, 'ssb'),
        showAsGraphText,
        showAsTableText,
      }),
      pageContributions: {
        bodyEnd: [...inlineScript, scriptAsset('js/highchart.js')],
      },
      contentType: 'text/html',
    }
  }
}

function determinConfigType(
  req: XP.Request,
  highchart: Content<CombinedGraph & DataSource>
): HighchartsExtendedProps | undefined {
  if (highchart.data.dataSource?._selected === 'htmlTable') {
    return createDataFromHtmlTable(req, highchart)
  }
  return undefined
}

function createDataFromHtmlTable(
  req: XP.Request,
  highchart: Content<CombinedGraph & DataSource>
): HighchartsExtendedProps {
  log.info('\x1b[32m%s\x1b[0m', '2. createDataFromHtmlTable')
  return {
    ...createCombinedGraphObject(req, highchart, highchart.data, highchart.data.dataSource ?? undefined),
  }
}

function createHighchartsReactProps(
  highchart: Content<CombinedGraph>,
  config: HighchartsExtendedProps
): HighchartsReactProps {
  return {
    config: config,
    contentKey: highchart._id,
    footnoteText: highchart.data.footnoteText ? util.data.forceArray(highchart.data.footnoteText) : undefined,
    creditsEnabled: highchart.data.sourceList ? true : false,
    sourceList: highchart.data.sourceList ? util.data.forceArray(highchart.data.sourceList) : undefined,
    hideTitle: highchart.data.hideTitle,
  }
}
type HighchartsExtendedProps = HighchartsGraphConfig & HighchartsReactExtraProps

interface HighchartsReactProps {
  config?: HighchartsExtendedProps
  description?: string
  //type?: string
  contentKey?: string
  footnoteText?: string[]
  creditsEnabled?: boolean
  sourceList?: CombinedGraph['sourceList']
  hideTitle?: boolean
}

interface HighchartsReactExtraProps {
  draft?: boolean
  noDraftAvailable?: boolean
}
