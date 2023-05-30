import { get as getContentByKey, type Content } from '/lib/xp/content'
import { type ResourceKey, render } from '/lib/thymeleaf'
import type { TableSourceList, TableView } from '/lib/ssb/parts/table'
import { SourceList, SourcesConfig, scriptAsset } from '/lib/ssb/utils/utils'
import {
  DropdownItem as TableDownloadDropdownItem,
  DropdownItems as TableDownloadDropdownItems,
} from '/lib/types/components'
import type { Language, Phrases } from '/lib/types/language'
import { render as r4xpRender } from '/lib/enonic/react4xp'
import type { Statistics, Table } from '/site/content-types'
import { GA_TRACKING_ID } from '/site/pages/default/default'
import type { Table as TablePartConfig } from '.'
import { DataSource as DataSourceType } from '/lib/ssb/repo/dataset'
import { getContent, getComponent, pageUrl, assetUrl } from '/lib/xp/portal'

const { renderError } = __non_webpack_require__('/lib/ssb/error/error')
const { parseTable } = __non_webpack_require__('/lib/ssb/parts/table')
const { getSources } = __non_webpack_require__('/lib/ssb/utils/utils')
const {
  data: { forceArray },
} = __non_webpack_require__('/lib/util')
const { getLanguage, getPhrases } = __non_webpack_require__('/lib/ssb/utils/language')
const { DATASET_BRANCH, UNPUBLISHED_DATASET_BRANCH } = __non_webpack_require__('/lib/ssb/repo/dataset')
const { hasWritePermissionsAndPreview } = __non_webpack_require__('/lib/ssb/parts/permissions')

const view: ResourceKey = resolve('./table.html') as ResourceKey

export function get(req: XP.Request): XP.Response {
  try {
    const config: TablePartConfig = getComponent().config
    const page: Content<Statistics> = getContent()
    const tableId: string = config.table ? config.table : (page.data.mainTable as string)
    return renderPart(req, tableId)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request, id?: string): XP.Response {
  return renderPart(req, id)
}

function getProps(req: XP.Request, tableId?: string): TableProps {
  const page: Content<Table> = getContent()
  const language: Language = getLanguage(page) as Language
  const phrases: Phrases = getPhrases(page) as Phrases

  const tableContent: Content<Table> | null = getContentByKey({
    key: tableId as string,
  }) as Content<Table>

  const datasourceHtmlTable: boolean = tableContent.data.dataSource?._selected === DataSourceType.HTMLTABLE

  const showPreviewDraft: boolean = hasWritePermissionsAndPreview(req, tableId as string)
  const table: TableView = parseTable(req, tableContent, DATASET_BRANCH)
  let tableDraft: TableView | undefined
  if (!datasourceHtmlTable && showPreviewDraft) {
    tableDraft = parseTable(req, tableContent, UNPUBLISHED_DATASET_BRANCH)
  }
  const draftExist: boolean | undefined = tableDraft && tableDraft.thead.length > 0
  const pageTypeStatistic: boolean = page.type === `${app.name}:statistics`

  // sources
  const sourceConfig: Table['sources'] | Array<SourcesConfig> = tableContent.data.sources
    ? forceArray(tableContent.data.sources)
    : []
  const sourceLabel: string = phrases.source
  const sourceTableLabel: string = phrases.statbankTableSource
  const sources: SourceList = getSources(sourceConfig as Array<SourcesConfig>)
  const iconUrl: string = assetUrl({
    path: 'swipe-icon.svg',
  })

  const standardSymbol: TableStandardSymbolLink | undefined = getStandardSymbolPage(
    language.standardSymbolPage,
    phrases.tableStandardSymbols
  )
  const baseUrl: string = app.config?.['ssb.baseUrl'] ? `${app.config['ssb.baseUrl'] as string}` : 'https://www.ssb.no'
  const statBankWebUrl: string = tableContent.language === 'en' ? baseUrl + '/en/statbank' : baseUrl + '/statbank'
  const sourceList: TableSourceList = table.sourceList ? forceArray(table.sourceList) : []
  const sourceListExternal: TableSourceList =
    sourceList.length > 0 ? sourceList.filter((s) => s.tableApproved === 'internet') : []
  const uniqueTableIds: Array<string> =
    sourceListExternal.length > 0
      ? sourceListExternal
          .map((item) => item.tableId.toString())
          .filter((value, index, self) => self.indexOf(value) === index)
      : []

  return {
    downloadTableLabel: phrases.tableDownloadAs,
    downloadTableTitle: {
      title: phrases.tableDownloadAs,
    },
    downloadTableOptions: getDownloadTableOptions(),
    displayName: tableContent.displayName,
    table: {
      caption: table.caption,
      thead: table.thead,
      tbody: table.tbody,
      tfoot: table.tfoot,
      tableClass: table.tableClass,
      language: language.code,
      noteRefs: table.noteRefs,
    },
    tableDraft: {
      caption: tableDraft ? tableDraft.caption : undefined,
      thead: tableDraft ? tableDraft.thead : undefined,
      tbody: tableDraft ? tableDraft.tbody : undefined,
      tfoot: tableDraft ? tableDraft.tfoot : undefined,
      noteRefs: tableDraft ? tableDraft.noteRefs : undefined,
    },
    standardSymbol: standardSymbol,
    sources,
    sourceLabel,
    iconUrl: iconUrl,
    showPreviewDraft,
    paramShowDraft: req.params.showDraft ? true : false,
    draftExist,
    pageTypeStatistic,
    sourceListTables: uniqueTableIds,
    sourceTableLabel,
    statBankWebUrl,
    hiddenTitle: table.caption ? table.caption.content : undefined,
    GA_TRACKING_ID: GA_TRACKING_ID,
  }
}
exports.getProps = getProps

function renderPart(req: XP.Request, tableId?: string): XP.Response {
  const page: Content<Table> = getContent()
  const phrases: Phrases = getPhrases(page) as Phrases

  if (!tableId) {
    if (req.mode === 'edit' && page.type !== `${app.name}:statistics`) {
      return {
        body: render(view, {
          label: phrases.table,
        }),
      }
    } else {
      return {
        body: null,
      }
    }
  }

  return r4xpRender('Table', getProps(req, tableId), req, {
    pageContributions: {
      bodyEnd: [scriptAsset('js/tableExport.js')],
    },
  })
}

function getDownloadTableOptions(): TableDownloadDropdownItems {
  const downloadTable: TableDownloadDropdownItems = []

  const XLS: TableDownloadDropdownItem = {
    title: '.xlsx (Excel)',
    id: 'downloadTableAsXLSX',
  }
  downloadTable.push(XLS)

  const CSV: TableDownloadDropdownItem = {
    title: '.CSV',
    id: 'downloadTableAsCSV',
  }
  downloadTable.push(CSV)

  return downloadTable
}

function getStandardSymbolPage(
  standardSymbolPage: Language['standardSymbolPage'],
  standardSymbolText: string
): TableStandardSymbolLink | undefined {
  if (standardSymbolPage) {
    const standardSymbolHref: string = pageUrl({
      id: standardSymbolPage,
    })

    return {
      href: standardSymbolHref,
      text: standardSymbolText,
    }
  }
  return
}

interface TableStandardSymbolLink {
  href: string
  text: string
}
interface TableProps {
  downloadTableLabel: string
  downloadTableTitle: object
  downloadTableOptions: TableDownloadDropdownItems
  displayName: string
  table: object
  tableDraft: object
  standardSymbol: TableStandardSymbolLink | undefined
  sources: SourceList
  sourceLabel: string
  iconUrl: string
  showPreviewDraft: boolean
  paramShowDraft: boolean
  draftExist: boolean | undefined
  pageTypeStatistic: boolean
  sourceListTables: Array<string>
  sourceTableLabel: string
  statBankWebUrl: string
  hiddenTitle: string | undefined
  GA_TRACKING_ID: string | null
}
