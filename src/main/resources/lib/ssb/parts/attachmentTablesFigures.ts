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

export function getTablesAndFigures(
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
  preview: XP.Response,
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
  const pageContributions: Array<XP.PageContributions> = attachmentTableAndFigure.reduce((acc, attachment) => {
    if (attachment.pageContributions?.bodyEnd) {
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
