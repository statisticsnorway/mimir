import { Content } from 'enonic-types/content'
import { ResourceKey, render } from 'enonic-types/thymeleaf'
import { DatasetRepoNode } from '../../../lib/ssb/repo/dataset'
import { JSONstat } from '../../../lib/types/jsonstat-toolkit'
import { Phrases } from '../../../lib/types/language'
import { React4xp, React4xpObject } from '../../../lib/types/react4xp'
import { TbmlDataUniform } from '../../../lib/types/xmlParser'
import { Statistics } from '../../content-types/statistics/statistics'
import { GA_TRACKING_ID } from '../../pages/default/default'
import { AccordionData } from '../accordion/accordion'
const {
  data: {
    forceArray
  }
} = __non_webpack_require__('/lib/util')
const {
  get
} = __non_webpack_require__('/lib/xp/content')
const {
  getContent,
  processHtml
} = __non_webpack_require__('/lib/xp/portal')
const {
  getPhrases
} = __non_webpack_require__('/lib/ssb/utils/language')

const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const {
  datasetOrUndefined
} = __non_webpack_require__('/lib/ssb/cache/cache')
// const {
//   fromPartCache
// } = __non_webpack_require__('/lib/ssb/cache/partCache')

const tableController: { getProps: (req: XP.Request, tableId: string) => object } = __non_webpack_require__('../table/table')
const highchartController: { preview: (req: XP.Request, id: string) => XP.Response } = __non_webpack_require__('../highchart/highchart')
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const view: ResourceKey = resolve('./attachmentTablesFigures.html')

exports.get = function(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: XP.Request): XP.Response => renderPart(req)

function renderPart(req: XP.Request): XP.Response {
  const page: Content<Statistics> = getContent()
  // TODO Fjernet caching siden den skapte problemer for forhåndsvisning av upubliserte tall
  // if (req.mode !== 'edit') {
  //   return fromPartCache(req, `${page._id}-attachmentTablesFigures`, () => {
  //     return getTablesAndFiguresComponent(page, req)
  //   })
  // }
  return getTablesAndFiguresComponent(page, req)
}

function getTablesAndFiguresComponent(page: Content<Statistics>, req: XP.Request): XP.Response {
  const phrases: Phrases = getPhrases(page) as Phrases

  const title: string = phrases.attachmentTablesFigures

  const attachmentTablesAndFigures: Array<string> = page.data.attachmentTablesFigures ? forceArray(page.data.attachmentTablesFigures) : []
  if (attachmentTablesAndFigures.length === 0) {
    if (req.mode === 'edit' && page.type !== `${app.name}:statistics`) {
      return {
        body: render(view, {
          label: title
        })
      }
    } else {
      return {
        body: null
      }
    }
  }

  const attachmentTableAndFigureView: Array<AttachmentTablesFiguresData> = getTablesAndFigures(attachmentTablesAndFigures, req, phrases)

  const accordionComponent: React4xpObject = new React4xp('AttachmentTablesFigures')
    .setProps({
      accordions: attachmentTableAndFigureView.map(({
        id, open, subHeader, body, contentType, props
      }) => {
        return {
          id,
          contentType,
          open,
          subHeader,
          body,
          props
        }
      }),
      freeText: page.data.freeTextAttachmentTablesFigures ? processHtml({
        value: page.data.freeTextAttachmentTablesFigures.replace(/&nbsp;/g, ' ')
      }) : undefined,
      showAll: phrases.showAll,
      showLess: phrases.showLess,
      appName: app.name,
      GA_TRACKING_ID: GA_TRACKING_ID
    })
    .setId('accordion')
    .uniqueId()

  const accordionBody: string = accordionComponent.renderBody({
    body: render(view, {
      title,
      accordionId: accordionComponent.react4xpId
    }),
    clientRender: true
  })

  const accordionPageContributions: string = accordionComponent.renderPageContributions({
    clientRender: true
  })
  const pageContributions: XP.PageContributions = getFinalPageContributions(accordionPageContributions as XP.PageContributions, attachmentTableAndFigureView)

  return {
    body: accordionBody,
    pageContributions,
    contentType: 'text/html'
  }
}

function getTablesAndFigures(attachmentTablesAndFigures: Array<string>, req: XP.Request, phrases: {[key: string]: string}): Array<AttachmentTablesFiguresData> {
  let figureIndex: number = 0
  let tableIndex: number = 0
  if (attachmentTablesAndFigures.length > 0) {
    return attachmentTablesAndFigures
      .filter((tableOrFigure) => !!tableOrFigure)
      .map((id, index) => {
        const content: Content | null = get({
          key: id
        })
        if (content && content.type === `${app.name}:table`) {
          ++tableIndex
          return getTableReturnObject(content, tableController.getProps(req, id), `${phrases.table} ${tableIndex}`, index)
        } else if (content && content.type === `${app.name}:highchart`) {
          ++figureIndex
          return getFigureReturnObject(content, highchartController.preview(req, id), `${phrases.figure} ${figureIndex}`, index)
        }
        return
      }) as Array<AttachmentTablesFiguresData>
  }
  return []
}

function getTableReturnObject(content: Content, props: object, subHeader: string, index: number): AttachmentTablesFiguresData {
  const datasetFromRepo: DatasetRepoNode<JSONstat | TbmlDataUniform | object> | undefined = datasetOrUndefined(content)
  const data: TbmlDataUniform | undefined = datasetFromRepo && datasetFromRepo.data as TbmlDataUniform
  const title: string | TbmlDataUniform['tbml']['metadata']['title'] = data && data.tbml && data.tbml.metadata ? data.tbml.metadata.title : content.displayName
  return {
    id: `attachment-table-figure-${index + 1}`,
    contentType: content.type,
    open: typeof(title) === 'string' ? title : title.content,
    subHeader,
    props
  }
}

function getFigureReturnObject(content: Content, preview: XP.Response, subHeader: string, index: number): AttachmentTablesFiguresData {
  const datasetFromRepo: DatasetRepoNode<JSONstat | TbmlDataUniform | object> | undefined = datasetOrUndefined(content)
  const data: TbmlDataUniform | undefined = datasetFromRepo && datasetFromRepo.data as TbmlDataUniform
  const title: string | TbmlDataUniform['tbml']['metadata']['title'] = data && data.tbml && data.tbml.metadata ? data.tbml.metadata.title : content.displayName
  return {
    id: `attachment-table-figure-${index + 1}`,
    contentType: content.type,
    open: typeof(title) === 'string' ? title : title.content,
    subHeader,
    body: preview.body as string | undefined,
    pageContributions: preview.pageContributions
  }
}

function getFinalPageContributions(
  accordionPageContributions: XP.PageContributions,
  attachmentTableAndFigure: Array<AttachmentTablesFiguresData>): XP.PageContributions {
  const pageContributions: Array<XP.PageContributions> = attachmentTableAndFigure.reduce((acc, attachment) => {
    if (attachment.pageContributions && attachment.pageContributions.bodyEnd) {
      acc = acc.concat(attachment.pageContributions.bodyEnd as unknown as ConcatArray<never>)
    }
    return acc
  }, [])

  if (pageContributions.length > 0) {
    return {
      headEnd: [].concat(accordionPageContributions.headEnd as unknown as ConcatArray<never>, pageContributions as unknown as ConcatArray<never>),
      bodyEnd: [].concat(accordionPageContributions.bodyEnd as unknown as ConcatArray<never>, pageContributions as unknown as ConcatArray<never>)
    }
  }
  return accordionPageContributions
}

interface AttachmentTablesFiguresData extends AccordionData {
  contentType: string;
  subHeader: string;
  props?: object;
  pageContributions?: XP.PageContributions;
}
