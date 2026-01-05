import { type Request, type Response } from '@enonic-types/core'
import { query, type Content } from '/lib/xp/content'
import { type DatasetRepoNode } from '/lib/ssb/repo/dataset'
import { type JSONstat } from '/lib/types/jsonstat-toolkit'
import { type TbmlDataUniform } from '/lib/types/xmlParser'
import { contentArrayToRecord } from '/lib/ssb/utils/arrayUtils'
import { notNullOrUndefined } from '/lib/ssb/utils/coreUtils'
import { datasetOrUndefined } from '/lib/ssb/cache/cache'
import { type AttachmentTablesFiguresData } from '/lib/types/partTypes/attachmentTablesFigures'
import { getProps } from '/site/parts/table/table'
import { preview as highchartPreview } from '/site/parts/highchart/highchart'
import { preview as highmapPreview } from '/site/parts/highmap/highmap'
import { preview as combinedGraphPreview } from '/site/parts/combinedGraph/combinedGraph'

export function getTablesAndFigures(
  attachmentTablesAndFigures: Array<string>,
  req: Request,
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
      } else if (attachmentTablesFiguresMap[id].type === `${app.name}:combinedGraph`) {
        ++figureIndex
        return getFigureReturnObject(
          attachmentTablesFiguresMap[id],
          combinedGraphPreview(req, id),
          `${phrases.figure} ${figureIndex}`,
          index
        )
      } else if (attachmentTablesFiguresMap[id].type === `${app.name}:highmap`) {
        ++figureIndex
        return getFigureReturnObject(
          attachmentTablesFiguresMap[id],
          highmapPreview(req, id),
          `${phrases.figure} ${figureIndex}`,
          index
        )
      }
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
  const title: string | TbmlDataUniform['tbml']['metadata']['title'] = getTitleFromDataset(content)
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
  preview: Response,
  subHeader: string,
  index: number
): AttachmentTablesFiguresData {
  const title: string | TbmlDataUniform['tbml']['metadata']['title'] = getTitleFromDataset(content)
  return {
    id: `attachment-table-figure-${index + 1}`,
    contentType: content.type,
    open: typeof title === 'string' ? title : title.content,
    subHeader,
    body: preview.body as string | undefined,
    pageContributions: preview.pageContributions,
  }
}

function getTitleFromDataset(content: Content): string | TbmlDataUniform['tbml']['metadata']['title'] {
  const datasetFromRepo: DatasetRepoNode<JSONstat | TbmlDataUniform | object> | undefined = datasetOrUndefined(content)
  const data: TbmlDataUniform | undefined = datasetFromRepo && (datasetFromRepo.data as TbmlDataUniform)
  return data?.tbml?.metadata?.title ?? content.displayName
}

export function getFinalPageContributions(
  accordionPageContributions: XP.PageContributions,
  attachmentTableAndFigure: Array<AttachmentTablesFiguresData>
): XP.PageContributions {
  const attachmentsHeadEnd = attachmentTableAndFigure.reduce<string[]>((acc, attachment) => {
    const pc = attachment.pageContributions
    if (pc?.headEnd) acc.push(...pc.headEnd)
    return acc
  }, [])

  const attachmentsBodyEnd = attachmentTableAndFigure.reduce<string[]>((acc, attachment) => {
    const pc = attachment.pageContributions
    if (pc?.bodyEnd) acc.push(...pc.bodyEnd)
    return acc
  }, [])

  if (!accordionPageContributions) {
    return {
      headEnd: attachmentsHeadEnd,
      bodyEnd: attachmentsBodyEnd,
    }
  }

  return {
    ...accordionPageContributions,
    headEnd: [...(accordionPageContributions.headEnd ?? []), ...attachmentsHeadEnd],
    bodyEnd: [...(accordionPageContributions.bodyEnd ?? []), ...attachmentsBodyEnd],
  }
}
