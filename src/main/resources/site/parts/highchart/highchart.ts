/* eslint-disable new-cap */
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import JSONstat from 'jsonstat-toolkit/import.mjs'
import { Component, PortalLibrary } from 'enonic-types/portal'
import { HighchartPartConfig } from './highchart-part-config'
import { Content, ContentLibrary } from 'enonic-types/content'
import { UtilLibrary } from '../../../lib/types/util'
import { Request, Response } from 'enonic-types/controller'
import { Highchart } from '../../content-types/highchart/highchart'
import { DatasetRepoNode } from '../../../lib/repo/dataset'
import { JSONstat as JSONstatType } from '../../../lib/types/jsonstat-toolkit'
import { TbmlDataUniform } from '../../../lib/types/xmlParser'
import { HighchartsGraphConfig } from '../../../lib/types/highcharts'
const {
  DataSource: DataSourceType,
  getDataset,
  UNPUBLISHED_DATASET_BRANCH
} = __non_webpack_require__( '/lib/repo/dataset')
const util: UtilLibrary = __non_webpack_require__( '/lib/util')
const {
  getComponent
}: PortalLibrary = __non_webpack_require__( '/lib/xp/portal')
const {
  render
} = __non_webpack_require__( '/lib/thymeleaf')
const {
  createHighchartObject
} = __non_webpack_require__('/lib/highcharts/highchartsUtils')

const {
  renderError
} = __non_webpack_require__('/lib/error/error')
const {
  datasetOrUndefined
} = __non_webpack_require__('/lib/ssb/cache')
const {
  hasWritePermissions
} = __non_webpack_require__('/lib/ssb/permissions')


const content: ContentLibrary = __non_webpack_require__( '/lib/xp/content')
const view: object = resolve('./highchart.html')

exports.get = function(req: Request): Response {
  try {
    const part: Component<HighchartPartConfig> = getComponent()
    const highchartIds: Array<string> = part.config.highchart ? util.data.forceArray(part.config.highchart) : []
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
  const highcharts: Array<HighchartsRectProps> = highchartIds.map((key) => {
    const highchart: Content<Highchart> | null = content.get({
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
      highcharts
    }),
    pageContributions: {
      bodyEnd: inlineScript
    },
    contentType: 'text/html'
  }
}


function determinConfigType(req: Request, highchart: Content<Highchart>): HighchartsExtendedProps | undefined {
  if (highchart && highchart.data.dataSource) {
    return createDataFromDataSource(req, highchart)
  } else if (highchart && highchart.data.htmlTable) {
    return createDataFromHtmlTable(req, highchart)
  }
  return undefined
}


function createDataFromHtmlTable(req: Request, highchart: Content<Highchart>): HighchartsExtendedProps {
  return {
    ...createHighchartObject(req, highchart, highchart.data, {
      _selected: 'htmlTable'
    })
  }
}


function createDataFromDataSource(req: Request, highchart: Content<Highchart>): HighchartsExtendedProps | undefined {
  if ( highchart && highchart.data && highchart.data.dataSource) {
    const type: string = highchart.data.dataSource._selected

    // get draft
    const paramShowDraft: boolean = req.params.showDraft !== undefined && req.params.showDraft === 'true'
    const showPreviewDraft: boolean = hasWritePermissions(req, highchart._id) && type === 'tbprocessor' && paramShowDraft
    const draftData: DatasetRepoNode<TbmlDataUniform> | null = showPreviewDraft && highchart.data.dataSource.tbprocessor ?
      getDataset(type, UNPUBLISHED_DATASET_BRANCH, highchart.data.dataSource.tbprocessor.urlOrId) : null

    // get dataset
    const datasetFromRepo: DatasetRepoNode<JSONstatType | TbmlDataUniform | object> = draftData ? draftData : datasetOrUndefined(highchart)
    let parsedData: JSONstatType | TbmlDataUniform | object | string | undefined = datasetFromRepo && datasetFromRepo.data
    if (parsedData !== undefined && type === DataSourceType.STATBANK_API) {
      // eslint-disable-next-line new-cap
      parsedData = JSONstat(parsedData).Dataset(0)
    }
    // create config
    const config: HighchartsExtendedProps = parsedData && createHighchartObject(req, highchart, parsedData, highchart.data.dataSource) || {}
    config.draft = !!draftData
    config.noDraftAvailable = showPreviewDraft && !draftData
    return config
  } else {
    return undefined
  }
}


function createHighchartsReactProps(highchart: Content<Highchart>, config: HighchartsExtendedProps): HighchartsRectProps {
  return {
    config: config,
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

interface HighchartsRectProps {
  config?: HighchartsExtendedProps;
  type?: string;
  contentKey?: string;
  footnoteText?: string;
  creditsEnabled?: boolean;
  creditsHref?: string;
  creditsText?: string;
  hideTitle?: boolean;
}

interface HighchartsReactExtraProps {
  draft: boolean;
  noDraftAvailable: boolean;
}
