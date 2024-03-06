// @ts-ignore
import JSONstat from 'jsonstat-toolkit/import.mjs'
import { get as getContentByKey, type Content } from '/lib/xp/content'
import { getComponent, getContent } from '/lib/xp/portal'
import { localize } from '/lib/xp/i18n'
import { JSONstat as JSONstatType } from '/lib/types/jsonstat-toolkit'
import { type TbmlDataUniform } from '/lib/types/xmlParser'
import { type HighchartsGraphConfig } from '/lib/types/highcharts'
import { render } from '/lib/thymeleaf'
import { render as r4XpRender } from '/lib/enonic/react4xp'
import {
  type DatasetRepoNode,
  DataSource as DataSourceType,
  getDataset,
  UNPUBLISHED_DATASET_BRANCH,
} from '/lib/ssb/repo/dataset'
import { scriptAsset } from '/lib/ssb/utils/utils'

import * as util from '/lib/util'
import { createHighchartObject } from '/lib/ssb/parts/highcharts/highchartsUtils'
import { renderError } from '/lib/ssb/error/error'
import { datasetOrUndefined } from '/lib/ssb/cache/cache'
import { hasWritePermissionsAndPreview } from '/lib/ssb/parts/permissions'
import { isEnabled } from '/lib/featureToggle'
import { getPhrases } from '/lib/ssb/utils/language'
import { getTbprocessorKey } from '/lib/ssb/dataset/tbprocessor/tbprocessor'
import { GA_TRACKING_ID } from '/site/pages/default/default'
import { type DataSource } from '/site/mixins/dataSource'
import { type CombinedGraph, type Highchart } from '/site/content-types'

const view = resolve('./highchart.html')

export function get(req: XP.Request): XP.Response {
  try {
    const part = getComponent<XP.PartComponent.Highchart>()
    if (!part) throw Error('No part found')

    const highchartIds: Array<string> = part.config.highchart ? util.data.forceArray(part.config.highchart) : []
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
      const highchart: Content<Highchart & DataSource> | Content<CombinedGraph> | null = getContentByKey({
        key,
      })
      const isCombinedGraph: boolean = highchart?.type === `${app.name}:combinedGraph`
      const config: HighchartsExtendedProps | undefined = determinConfigType(req, highchart, isCombinedGraph)
      return highchart && config ? createHighchartsReactProps(highchart as Content<Highchart>, config) : {}
    })
    .filter((key) => !!key)

  const inlineScript: Array<string> = highcharts.map(
    (highchart) => `<script type="text/javascript">
   window['highchart' + '${highchart.contentKey}'] = ${JSON.stringify(highchart.config)}
   </script>`
  )

  const HighchartProps: object = {
    highcharts: highcharts,
    phrases: getPhrases(page),
    appName: app.name,
    pageType: page.type,
    GA_TRACKING_ID: GA_TRACKING_ID,
  }

  if (isEnabled('highchart-react', true, 'ssb')) {
    // R4xp disables hydration in edit mode, but highcharts need hydration to show
    // we sneaky swap mode since we want a render of higchart in edit mode
    // Works good for highchart macro, not so much when part
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
  highchart: Content<Highchart & DataSource> | Content<CombinedGraph> | null,
  isCombinedGraph: boolean
): HighchartsExtendedProps | undefined {
  if (isCombinedGraph) {
    return createDataFromHtmlTable(req, highchart as Content<CombinedGraph>)
  }
  if (highchart && highchart.data.dataSource) {
    return createDataFromDataSource(req, highchart as Content<Highchart & DataSource>)
  } else if ((highchart as Content<Highchart>)?.data.htmlTable) {
    return createDataFromHtmlTable(req, highchart as Content<Highchart>)
  }
  return undefined
}

function createDataFromHtmlTable(
  req: XP.Request,
  highchart: Content<Highchart & DataSource> | Content<CombinedGraph>
): HighchartsExtendedProps {
  return {
    ...createHighchartObject(req, highchart, highchart.data, undefined),
  }
}

function createDataFromDataSource(
  req: XP.Request,
  highchart: Content<Highchart & DataSource>
): HighchartsExtendedProps | undefined {
  if (highchart && highchart.data && highchart.data.dataSource) {
    const type: string = highchart.data.dataSource._selected

    // get draft
    const paramShowDraft: boolean = req.params.showDraft !== undefined && req.params.showDraft === 'true'
    const showPreviewDraft: boolean =
      hasWritePermissionsAndPreview(req, highchart._id) && type === 'tbprocessor' && paramShowDraft
    const draftData: DatasetRepoNode<TbmlDataUniform> | null =
      showPreviewDraft &&
      highchart.data.dataSource._selected === DataSourceType.TBPROCESSOR &&
      highchart.data.dataSource.tbprocessor?.urlOrId
        ? getDataset(type, UNPUBLISHED_DATASET_BRANCH, getTbprocessorKey(highchart))
        : null

    // get dataset
    const datasetFromRepo: DatasetRepoNode<JSONstatType | TbmlDataUniform | object> | undefined = draftData
      ? draftData
      : datasetOrUndefined(highchart)
    let parsedData: JSONstatType | TbmlDataUniform | object | string | undefined =
      datasetFromRepo && datasetFromRepo.data
    if (parsedData !== undefined && type === DataSourceType.STATBANK_API) {
      // eslint-disable-next-line new-cap
      parsedData = JSONstat(parsedData).Dataset(0)
    }
    // create config
    const config: HighchartsExtendedProps =
      (parsedData && createHighchartObject(req, highchart, parsedData, highchart.data.dataSource)) ||
      ({} as HighchartsExtendedProps)
    config.draft = !!draftData
    config.noDraftAvailable = showPreviewDraft && !draftData
    return config
  } else {
    return undefined
  }
}

function createHighchartsReactProps(
  highchart: Content<Highchart>,
  config: HighchartsExtendedProps
): HighchartsReactProps {
  return {
    config: config,
    type: highchart.type === 'mimir:combinedGraph' ? 'combined' : highchart.data.graphType,
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
  type?: string
  contentKey?: string
  footnoteText?: string[]
  creditsEnabled?: boolean
  sourceList?: Highchart['sourceList']
  hideTitle?: boolean
}

interface HighchartsReactExtraProps {
  draft?: boolean
  noDraftAvailable?: boolean
}
