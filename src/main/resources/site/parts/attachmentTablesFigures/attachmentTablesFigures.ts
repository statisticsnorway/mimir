import { query, type Content } from '/lib/xp/content'
import { getContent, processHtml } from '/lib/xp/portal'
import { type DatasetRepoNode } from '/lib/ssb/repo/dataset'
import { type JSONstat } from '/lib/types/jsonstat-toolkit'
import { type Phrases } from '/lib/types/language'
import { render as r4XpRender } from '/lib/enonic/react4xp'
import { type TbmlDataUniform } from '/lib/types/xmlParser'
import { contentArrayToRecord } from '/lib/ssb/utils/arrayUtils'
import { notNullOrUndefined } from '/lib/ssb/utils/coreUtils'

import * as util from '/lib/util'
import { getPhrases } from '/lib/ssb/utils/language'
import { renderError } from '/lib/ssb/error/error'
import { datasetOrUndefined } from '/lib/ssb/cache/cache'
import { type AccordionData } from '/site/parts/accordion/accordion'
import { GA_TRACKING_ID } from '/site/pages/default/default'
import { type Statistics } from '/site/content-types'

const tableController: { getProps: (req: XP.Request, tableId: string) => object } =
  __non_webpack_require__('../table/table')
const highchartController: { preview: (req: XP.Request, id: string) => XP.Response } =
  __non_webpack_require__('../highchart/highchart')

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

  const attachmentTablesAndFigures: Array<string> = page.data.attachmentTablesFigures
    ? util.data.forceArray(page.data.attachmentTablesFigures)
    : []
  const attachmentTableAndFigureView: Array<AttachmentTablesFiguresData> = getTablesAndFigures(
    attachmentTablesAndFigures,
    req,
    phrases
  )
  const attachmentTablesFiguresProps: object = {
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
    appName: app.name,
    GA_TRACKING_ID: GA_TRACKING_ID,
    title,
  }

  const accordionComponent = r4XpRender('AttachmentTablesFigures', attachmentTablesFiguresProps, req, {
    id: 'accordion',
    body: `<section class="xp-part attachment-tables-figures"></section>`,
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
): Array<AttachmentTablesFiguresData> {
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
          tableController.getProps(req, id),
          `${phrases.table} ${tableIndex}`,
          index
        )
      } else if (attachmentTablesFiguresMap[id].type === `${app.name}:highchart`) {
        ++figureIndex
        return getFigureReturnObject(
          attachmentTablesFiguresMap[id],
          highchartController.preview(req, id),
          `${phrases.figure} ${figureIndex}`,
          index
        )
      }
      return
    }) as Array<AttachmentTablesFiguresData>
  }
  return []
}

function getTableReturnObject(
  content: Content,
  props: object,
  subHeader: string,
  index: number
): AttachmentTablesFiguresData {
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
): AttachmentTablesFiguresData {
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
  attachmentTableAndFigure: Array<AttachmentTablesFiguresData>
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

interface AttachmentTablesFiguresData extends AccordionData {
  contentType: string
  subHeader: string
  props?: object
  pageContributions?: XP.PageContributions
}
