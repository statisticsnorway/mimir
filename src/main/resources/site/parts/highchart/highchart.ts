import JsonStat from 'jsonstat-toolkit'
import { Component, PortalLibrary } from 'enonic-types/portal'
import { HighchartPartConfig } from './highchart-part-config'
import { Content, ContentLibrary } from 'enonic-types/content'
import { UtilLibrary } from '../../../lib/types/util'
import { Request, Response } from 'enonic-types/controller'
import { Highchart } from '../../content-types/highchart/highchart'
import {DatasetRepoNode} from "../../../lib/repo/dataset";
import {JSONstat} from "../../../lib/types/jsonstat-toolkit";
import {TbmlDataUniform} from "../../../lib/types/xmlParser";
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
const view: any = resolve('./highchart.html')

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

/**
 * @param {object} req
 * @param {array<string>} highchartIds
 * @return {{body: *, contentType: string}}
 */
function renderPart(req: Request, highchartIds: Array<string>): Response {
  const highcharts: Array<HighchartsRectProps> = highchartIds.map((key) => {
    const highchart: Content<Highchart> | null = content.get({
      key
    })

    let config
    if (highchart && highchart.data.dataSource) {
      const type: string = highchart.data.dataSource._selected
      const paramShowDraft: boolean = req.params.showDraft !== undefined && req.params.showDraft === 'true'
      const showPreviewDraft: boolean = hasWritePermissions(req, highchart._id) && type === 'tbprocessor' && paramShowDraft
      const draftData: DatasetRepoNode<TbmlDataUniform> | null = showPreviewDraft && highchart.data.dataSource.tbprocessor ?
        getDataset(type, UNPUBLISHED_DATASET_BRANCH, highchart.data.dataSource.tbprocessor.urlOrId) : null

      const datasetFromRepo: DatasetRepoNode<JSONstat | TbmlDataUniform | object> = draftData ? draftData : datasetOrUndefined(highchart)
      let parsedData: JSONstat | TbmlDataUniform | object | string | undefined = datasetFromRepo && datasetFromRepo.data
      if (type === DataSourceType.STATBANK_API) {
        // eslint-disable-next-line new-cap
        parsedData = JsonStat(parsedData).Dataset(0)
      }
      config = parsedData && createHighchartObject(req, highchart, parsedData, highchart.data.dataSource) || undefined
      config.draft = !!draftData
      config.noDraftAvailable = showPreviewDraft && !draftData
    } else if (highchart && highchart.data.htmlTable) {
      config = {
        ...createHighchartObject(req, highchart, highchart.data, {
          _selected: 'htmlTable'
        })
      }
    }
    return createHighchartsReactProps(highchart, config)
  }).filter((key) => !!key)

  const inlineScript = highcharts.map((highchart) => `<script inline="javascript">
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

function createHighchartsReactProps(highchart: Content<Highchart>, config): HighchartsRectProps {
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

interface HighchartsRectProps {
  config: HighchartsReactPropsConfig;
  type: string;
  contentKey: string;
  footnoteText: string;
  creditsEnabled: boolean;
  creditsHref: string;
  creditsText: string;
  hideTitle: boolean;
}

interface HighchartsReactPropsConfig {
  draft: boolean;
  noDraftAvailable: boolean;
}
