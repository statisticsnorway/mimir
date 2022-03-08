import { Content } from '/lib/xp/content'
import { ResourceKey } from '/lib/thymeleaf'
import { DatasetRepoNode } from '../../../lib/ssb/repo/dataset'
import { JSONstat } from '../../../lib/types/jsonstat-toolkit'
import { render as r4xpRender } from '/lib/enonic/react4xp'
import { TbmlDataUniform } from '../../../lib/types/xmlParser'
import { Statistics } from '../../content-types/statistics/statistics'
import { GA_TRACKING_ID } from '../../pages/default/default'
import { AccordionData } from '../accordion/accordion'
import {Component, getComponent} from "/lib/xp/portal";
import {PublicationArchivePartConfig} from "../publicationArchive/publicationArchive-part-config";
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
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const {
  datasetOrUndefined
} = __non_webpack_require__('/lib/ssb/cache/cache')


const tableController: { getProps: (req: XP.Request, tableId: string) => object } = __non_webpack_require__('../table/table')
const highchartController: { preview: (req: XP.Request, id: string) => XP.Response } = __non_webpack_require__('../highchart/highchart')
const view: ResourceKey = resolve('./attachmentTablesFigures.html')

exports.get = function (req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: XP.Request): XP.Response => renderPart(req)

function renderPart(req: XP.Request): XP.Response {
  const content: Content<Statistics> = getContent()
  const part: Component<PublicationArchivePartConfig> = getComponent()

  const phrases: { [key: string]: string } = getPhrases(content)
  const title: string = phrases.attachmentTablesFigures

  const attachmentTablesAndFigures: Array<string> = content.data.attachmentTablesFigures ? forceArray(content.data.attachmentTablesFigures) : []
  const attachmentTableAndFigureView: Array<AttachmentTablesFiguresData> = getTablesAndFigures(attachmentTablesAndFigures, req, phrases)

  const props: PartProperties = {
    title: title,
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
    freeText: content.data.freeTextAttachmentTablesFigures ? processHtml({
      value: content.data.freeTextAttachmentTablesFigures.replace(/&nbsp;/g, ' ')
    }) : undefined,
    showAll: phrases.showAll,
    showLess: phrases.showLess,
    appName: app.name,
    GA_TRACKING_ID: GA_TRACKING_ID
  }

  return r4xpRender('site/parts/attachmentTablesFigures/attachmentTablesFigures', props, req)

}

// eslint-disable-next-line max-len
function getTablesAndFigures(attachmentTablesAndFigures: Array<string>, req: XP.Request, phrases: { [key: string]: string }): Array<AttachmentTablesFiguresData> {
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
    open: typeof (title) === 'string' ? title : title.content,
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
    open: typeof (title) === 'string' ? title : title.content,
    subHeader,
    body: preview.body as string | undefined,
    pageContributions: preview.pageContributions
  }
}

interface AttachmentTablesFiguresData extends AccordionData {
  contentType: string;
  subHeader: string;
  props?: object;
  pageContributions?: XP.PageContributions;
}

interface PartProperties {
  title: string;
  accordions: Array<{
    id: string | undefined;
    contentType: string;
    open: string | undefined;
    subHeader: string;
    body: string | undefined;
    props: object | undefined;
  }>
  freeText: string | undefined;
  showAll: string;
  showLess: string;
  appName: string;
  GA_TRACKING_ID: string | null;
}
