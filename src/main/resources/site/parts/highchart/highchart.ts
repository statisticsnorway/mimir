// @ts-ignore
import JSONstat from 'jsonstat-toolkit/import.mjs'
import { type Request, type Response } from '@enonic-types/core'
import { get as getContentByKey, type Content } from '/lib/xp/content'
import { getComponent, getContent } from '/lib/xp/portal'
import { JSONstat as JSONstatType } from '/lib/types/jsonstat-toolkit'
import { type TbmlDataUniform } from '/lib/types/xmlParser'
import { render as r4XpRender } from '/lib/enonic/react4xp'
import {
  type DatasetRepoNode,
  DataSource as DataSourceType,
  getDataset,
  UNPUBLISHED_DATASET_BRANCH,
} from '/lib/ssb/repo/dataset'

import * as util from '/lib/util'
import { createHighchartObject } from '/lib/ssb/parts/highcharts/highchartsUtils'
import { renderError } from '/lib/ssb/error/error'
import { datasetOrUndefined } from '/lib/ssb/cache/cache'
import { hasWritePermissionsAndPreview } from '/lib/ssb/parts/permissions'
import { getPhrases } from '/lib/ssb/utils/language'
import { getTbprocessorKey } from '/lib/ssb/dataset/tbprocessor/tbprocessor'
import {
  type HighchartsExtendedProps,
  type HighchartsPartProps,
  type HighchartsReactProps,
} from '/lib/types/partTypes/highchartsReact'
import { type DataSource } from '/site/mixins/dataSource'
import { type CombinedGraph, type Highchart } from '/site/content-types'

export function get(req: Request): Response {
  try {
    const part = getComponent<XP.PartComponent.Highchart>()
    if (!part) throw Error('No part found')

    const highchartIds: Array<string> = part.config.highchart ? util.data.forceArray(part.config.highchart) : []
    return renderPart(req, highchartIds)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: Request, id: string): Response {
  try {
    return renderPart(req, [id])
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

function renderPart(req: Request, highchartIds: Array<string>): Response {
  const page = getContent()
  if (!page) throw Error('No page found')

  const language: string = page.language ? page.language : 'nb'

  const highcharts: Array<HighchartsPartProps> = highchartIds
    .map((key) => {
      const highchart: Content<Highchart & DataSource> | Content<CombinedGraph> | null = getContentByKey({
        key,
      })
      const isCombinedGraph: boolean = highchart?.type === `${app.name}:combinedGraph`
      const config: HighchartsExtendedProps | undefined = determinConfigType(req, highchart, isCombinedGraph)
      return highchart && config ? createHighchartsPartProps(highchart as Content<Highchart>, config) : {}
    })
    .filter((key) => !!key)

  const highchartsReactProps: HighchartsReactProps = {
    highcharts,
    language,
    phrases: getPhrases(page),
  }

  // R4xp disables hydration in edit mode, but highcharts need hydration to show
  // we sneaky swap mode since we want a render of higchart in edit mode
  // Works good for highchart macro, not so much when part
  const _req = req
  if (req.mode === 'edit') _req.mode = 'preview'

  return r4XpRender('site/parts/highchart/Highchart', highchartsReactProps, _req, {
    body: '<section class="xp-part highchart-wrapper"></section>',
  })
}

function determinConfigType(
  req: Request,
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
  req: Request,
  highchart: Content<Highchart & DataSource> | Content<CombinedGraph>
): HighchartsExtendedProps {
  return {
    ...createHighchartObject(req, highchart, highchart.data, undefined),
  }
}

function createDataFromDataSource(
  req: Request,
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

function createHighchartsPartProps(
  highchart: Content<Highchart>,
  config: HighchartsExtendedProps
): HighchartsPartProps {
  return {
    config: config,
    type: highchart.type === 'mimir:combinedGraph' ? 'combined' : highchart.data.graphType,
    contentKey: highchart._id,
    footnoteText: highchart.data.footnoteText ? util.data.forceArray(highchart.data.footnoteText) : undefined,
    creditsEnabled: highchart.data.sourceList ? true : false,
    sourceList: highchart.data.sourceList ? util.data.forceArray(highchart.data.sourceList) : undefined,
    defaultShowAsTable: highchart.data.defaultShowAsTable || false,
  }
}
