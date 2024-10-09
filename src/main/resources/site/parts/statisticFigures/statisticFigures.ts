import { query, type Content } from '/lib/xp/content'
import { getContent, processHtml, assetUrl } from '/lib/xp/portal'
import { type DatasetRepoNode } from '/lib/ssb/repo/dataset'
import { type JSONstat } from '/lib/types/jsonstat-toolkit'
import { type Phrases } from '/lib/types/language'
import { render as r4XpRender } from '/lib/enonic/react4xp'
import { type StatisticInListing } from '/lib/ssb/dashboard/statreg/types'
import { type TbmlDataUniform } from '/lib/types/xmlParser'
import { contentArrayToRecord } from '/lib/ssb/utils/arrayUtils'
import { notNullOrUndefined } from '/lib/ssb/utils/coreUtils'
import { getStatisticByIdFromRepo } from '/lib/ssb/statreg/statistics'

import * as util from '/lib/util'
import { getPhrases } from '/lib/ssb/utils/language'
import { renderError } from '/lib/ssb/error/error'
import { datasetOrUndefined } from '/lib/ssb/cache/cache'
import { type StatisticFiguresData, type StatisticFiguresProps } from '/lib/types/partTypes/statisticFigures'
import { type Statistics } from '/site/content-types'
import { getProps } from '/site/parts/table/table'
import { preview as highchartPreview } from '/site/parts/highchart/highchart'

const STATBANKWEB_URL: string =
  app.config && app.config['ssb.statbankweb.baseUrl']
    ? app.config['ssb.statbankweb.baseUrl']
    : 'https://www.ssb.no/statbank'

export function get(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request): XP.Response {
  return renderPart(req)
}

function renderPart(req: XP.Request): XP.Response {
  const page = getContent<Content<Statistics>>()
  if (!page) throw Error('No page found')

  return getTablesAndFiguresComponent(page, req)
}

function getTablesAndFiguresComponent(page: Content<Statistics>, req: XP.Request): XP.Response {
  const phrases: Phrases = getPhrases(page) as Phrases

  const title: string = phrases.attachmentTablesFigures

  const statistic: StatisticInListing | undefined = (page.data.statistic &&
    getStatisticByIdFromRepo(page.data.statistic)) as StatisticInListing | undefined
  const shortName: string | undefined = statistic && statistic.shortName ? statistic.shortName : undefined

  const attachmentTablesAndFigures: Array<string> = page.data.attachmentTablesFigures
    ? util.data.forceArray(page.data.attachmentTablesFigures)
    : []

  if (page.data.mainTable) {
    attachmentTablesAndFigures.unshift(page.data.mainTable)
  }
  const attachmentTableAndFigureView: Array<StatisticFiguresData> = getTablesAndFigures(
    attachmentTablesAndFigures,
    req,
    phrases
  )
  const StatisticFiguresProps: StatisticFiguresProps = {
    accordions: attachmentTableAndFigureView.map(({ id, open, subHeader, body, contentType, props }) => {
      return {
        id,
        contentType,
        open,
        subHeader,
        body,
        props,
      }
    }),
    freeText: page.data.freeTextAttachmentTablesFigures
      ? processHtml({
          value: page.data.freeTextAttachmentTablesFigures.replace(/&nbsp;/g, ' '),
        })
      : undefined,
    showAll: phrases.showAll,
    showLess: phrases.showLess,
    selectedFigures: phrases.statisticSelectedFigures,
    statbankBoxTitle: phrases.statisticStatbankBoxTitle,
    statbankBoxText: phrases.statisticStatbankBoxText,
    appName: app.name,
    title,
    icon: assetUrl({
      path: 'SSB_ikon_statisticFigures.svg',
    }),
    iconStatbankBox: assetUrl({
      path: 'SSB_ikon_statbank.svg',
    }),
    statbankHref: `${STATBANKWEB_URL}/list/${shortName}`,
  }

  const accordionComponent = r4XpRender('StatisticFigures', StatisticFiguresProps, req, {
    id: 'figures',
    body: `<section class="xp-part statistic-figures"></section>`,
  })

  const accordionBody: string | null = accordionComponent.body
  const accordionPageContributions: XP.PageContributions = accordionComponent.pageContributions
  const pageContributions: XP.PageContributions | null = getFinalPageContributions(
    accordionPageContributions,
    attachmentTableAndFigureView
  )

  if (!attachmentTablesAndFigures.length && !(req.mode === 'edit' && page.type !== `${app.name}:statistics`)) {
    return {
      body: null,
    }
  } else {
    return {
      body: accordionBody,
      pageContributions,
      contentType: 'text/html',
    }
  }
}

function getTablesAndFigures(
  attachmentTablesAndFigures: Array<string>,
  req: XP.Request,
  phrases: { [key: string]: string }
): Array<StatisticFiguresData> {
  let figureIndex = 0
  let tableIndex = 0
  if (attachmentTablesAndFigures.length > 0) {
    const attachmentTablesFiguresIds = attachmentTablesAndFigures.map((id) => id).filter(notNullOrUndefined)
    const attachmentTablesFiguresHits = query({
      count: attachmentTablesFiguresIds.length,
      filters: {
        ids: {
          values: attachmentTablesFiguresIds,
        },
      },
    }).hits
    const attachmentTablesFiguresMap = contentArrayToRecord(attachmentTablesFiguresHits)
    return attachmentTablesAndFigures.map((id, index) => {
      if (attachmentTablesFiguresMap[id].type === `${app.name}:table`) {
        ++tableIndex
        return getTableReturnObject(
          attachmentTablesFiguresMap[id],
          getProps(req, id),
          `${phrases.table} ${tableIndex}`,
          index
        )
      } else if (attachmentTablesFiguresMap[id].type === `${app.name}:highchart`) {
        ++figureIndex
        return getFigureReturnObject(
          attachmentTablesFiguresMap[id],
          highchartPreview(req, id),
          `${phrases.figure} ${figureIndex}`,
          index
        )
      }
      return
    }) as Array<StatisticFiguresData>
  }
  return []
}

function getTableReturnObject(content: Content, props: object, subHeader: string, index: number): StatisticFiguresData {
  const datasetFromRepo: DatasetRepoNode<JSONstat | TbmlDataUniform | object> | undefined = datasetOrUndefined(content)
  const data: TbmlDataUniform | undefined = datasetFromRepo && (datasetFromRepo.data as TbmlDataUniform)
  const title: string | TbmlDataUniform['tbml']['metadata']['title'] =
    data && data.tbml && data.tbml.metadata ? data.tbml.metadata.title : content.displayName
  return {
    id: `attachment-table-figure-${index + 1}`,
    contentType: content.type,
    open: typeof title === 'string' ? title : title.content,
    subHeader,
    props,
  }
}

function getFigureReturnObject(
  content: Content,
  preview: XP.Response,
  subHeader: string,
  index: number
): StatisticFiguresData {
  const datasetFromRepo: DatasetRepoNode<JSONstat | TbmlDataUniform | object> | undefined = datasetOrUndefined(content)
  const data: TbmlDataUniform | undefined = datasetFromRepo && (datasetFromRepo.data as TbmlDataUniform)
  const title: string | TbmlDataUniform['tbml']['metadata']['title'] =
    data && data.tbml && data.tbml.metadata ? data.tbml.metadata.title : content.displayName
  return {
    id: `attachment-table-figure-${index + 1}`,
    contentType: content.type,
    open: typeof title === 'string' ? title : title.content,
    subHeader,
    body: preview.body as string | undefined,
    pageContributions: preview.pageContributions,
  }
}

function getFinalPageContributions(
  accordionPageContributions: XP.PageContributions,
  attachmentTableAndFigure: Array<StatisticFiguresData>
): XP.PageContributions {
  const pageContributions: Array<XP.PageContributions> = attachmentTableAndFigure.reduce((acc, attachment) => {
    if (attachment.pageContributions && attachment.pageContributions.bodyEnd) {
      acc = acc.concat(attachment.pageContributions.bodyEnd as unknown as ConcatArray<never>)
    }
    return acc
  }, [])

  if (pageContributions.length > 0 && accordionPageContributions) {
    return {
      headEnd: [].concat(
        accordionPageContributions.headEnd as unknown as ConcatArray<never>,
        pageContributions as unknown as ConcatArray<never>
      ),
      bodyEnd: [].concat(
        accordionPageContributions.bodyEnd as unknown as ConcatArray<never>,
        pageContributions as unknown as ConcatArray<never>
      ),
    }
  }
  return accordionPageContributions
}
