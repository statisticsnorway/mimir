/* eslint-disable new-cap */
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import JSONstat from 'jsonstat-toolkit/import.mjs'
import { Component } from 'enonic-types/portal'
import { HighchartPartConfig } from './highchart-part-config'
import { Content } from 'enonic-types/content'
import { Request, Response } from 'enonic-types/controller'
import { Highchart } from '../../content-types/highchart/highchart'
import { DatasetRepoNode } from '../../../lib/ssb/repo/dataset'
import { JSONstat as JSONstatType } from '../../../lib/types/jsonstat-toolkit'
import { TbmlDataUniform } from '../../../lib/types/xmlParser'
import { HighchartsGraphConfig } from '../../../lib/types/highcharts'
import { ResourceKey } from 'enonic-types/thymeleaf'
import { DataSource } from '../../mixins/dataSource/dataSource'
const {
  DataSource: DataSourceType,
  getDataset,
  UNPUBLISHED_DATASET_BRANCH
} = __non_webpack_require__('/lib/ssb/repo/dataset')
const {
  data: {
    forceArray
  }
} = __non_webpack_require__('/lib/util')
const {
  getComponent,
  getContent
} = __non_webpack_require__('/lib/xp/portal')
const {
  localize
} = __non_webpack_require__('/lib/xp/i18n')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  createHighchartObject
} = __non_webpack_require__('/lib/ssb/parts/highcharts/highchartsUtils')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const {
  datasetOrUndefined
} = __non_webpack_require__('/lib/ssb/cache/cache')
const {
  hasWritePermissionsAndPreview
} = __non_webpack_require__('/lib/ssb/parts/permissions')
const {
  get
} = __non_webpack_require__('/lib/xp/content')
const view: ResourceKey = resolve('./highchart.html')

exports.get = function(req: Request): Response {
  try {
    const part: Component<HighchartPartConfig> = getComponent()
    const highchartIds: Array<string> = part.config.highchart ? forceArray(part.config.highchart) : []
    return renderPart(req, highchartIds)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: Request, id: string): Response => {
  try {
    return renderPart(req, [id])
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}


function renderPart(req: Request, highchartIds: Array<string>): Response {
  const page: Content = getContent()
  const language: string = page.language ? page.language : 'nb'

  //  Must be set to nb instead of no for localization
  const sourceText: string = localize({
    key: 'highcharts.source',
    locale: language === 'nb' ? 'no' : language
  })
  const downloadText: string = localize({
    key: 'highcharts.download',
    locale: language === 'nb' ? 'no' : language
  })

  const highcharts: Array<HighchartsReactProps> = highchartIds.map((key) => {
    const highchart: Content<Highchart> | null = get({
      key
    })
    const config: HighchartsExtendedProps | undefined = highchart ? determinConfigType(req, highchart) : undefined
    return highchart && config ? createHighchartsReactProps(highchart, config) : {}
  }).filter((key) => !!key)

  const inlineScript: Array<string> = highcharts.map((highchart) => `<script inline="javascript">
   window['highchart' + '${highchart.contentKey}'] = ${JSON.stringify(highchart.config)}
   </script>`)

  return {
    body: render(view, {
      highcharts,
      downloadText,
      sourceText
    }),
    pageContributions: {
      bodyEnd: inlineScript
    },
    contentType: 'text/html'
  }
}


function determinConfigType(req: Request, highchart: Content<Highchart & DataSource>): HighchartsExtendedProps | undefined {
  if (highchart && highchart.data.dataSource) {
    return createDataFromDataSource(req, highchart)
  } else if (highchart && highchart.data.htmlTable) {
    return createDataFromHtmlTable(req, highchart)
  }
  return undefined
}


function createDataFromHtmlTable(req: Request, highchart: Content<Highchart & DataSource>): HighchartsExtendedProps {
  return {
    ...createHighchartObject(req, highchart, highchart.data, undefined)
  }
}


function createDataFromDataSource(req: Request, highchart: Content<Highchart & DataSource>): HighchartsExtendedProps | undefined {
  if ( highchart && highchart.data && highchart.data.dataSource) {
    const type: string = highchart.data.dataSource._selected

    // get draft
    const paramShowDraft: boolean = req.params.showDraft !== undefined && req.params.showDraft === 'true'
    const showPreviewDraft: boolean = hasWritePermissionsAndPreview(req, highchart._id) && type === 'tbprocessor' && paramShowDraft
    const draftData: DatasetRepoNode<TbmlDataUniform> | null =
      showPreviewDraft &&
      highchart.data.dataSource._selected === DataSourceType.TBPROCESSOR &&
      highchart.data.dataSource.tbprocessor?.urlOrId ?
        getDataset(type, UNPUBLISHED_DATASET_BRANCH, highchart.data.dataSource.tbprocessor.urlOrId) : null

    // get dataset
    const datasetFromRepo: DatasetRepoNode<JSONstatType | TbmlDataUniform | object> | undefined = draftData ? draftData : datasetOrUndefined(highchart)
    let parsedData: JSONstatType | TbmlDataUniform | object | string | undefined = datasetFromRepo && datasetFromRepo.data
    if (parsedData !== undefined && type === DataSourceType.STATBANK_API) {
      // eslint-disable-next-line new-cap
      parsedData = JSONstat(parsedData).Dataset(0)
    }
    // create config
    const config: HighchartsExtendedProps =
      parsedData && createHighchartObject(req, highchart, parsedData, highchart.data.dataSource) || ({} as HighchartsExtendedProps)
    config.draft = !!draftData
    config.noDraftAvailable = showPreviewDraft && !draftData
    return config
  } else {
    return undefined
  }
}


function createHighchartsReactProps(highchart: Content<Highchart>, config: HighchartsExtendedProps): HighchartsReactProps {
  return {
    config: config,
    description: highchart.data.description,
    type: highchart.data.graphType,
    contentKey: highchart._id,
    footnoteText: highchart.data.footnoteText,
    creditsEnabled: (highchart.data.creditsHref || highchart.data.creditsText) ? true : false,
    creditsHref: highchart.data.creditsHref,
    creditsText: highchart.data.creditsText,
    hideTitle: highchart.data.hideTitle
  }
}
type HighchartsExtendedProps = HighchartsGraphConfig & HighchartsReactExtraProps

interface HighchartsReactProps {
  config?: HighchartsExtendedProps;
  description?: string;
  type?: string;
  contentKey?: string;
  footnoteText?: string;
  creditsEnabled?: boolean;
  creditsHref?: string;
  creditsText?: string;
  hideTitle?: boolean;
}

interface HighchartsReactExtraProps {
  draft?: boolean;
  noDraftAvailable?: boolean;
}
