import { type SourceList } from '/lib/types/sources'
import { type DropdownItems } from '/lib/types/components'
import { type Note, type PreliminaryData, type Source, type TableRowUniform, type Title } from '/lib/types/xmlParser'

export interface TableProps {
  downloadTableLabel: string
  downloadTableTitle: object
  downloadTableOptions: DropdownItems
  displayName: string
  table: Partial<TableView> & {
    language: string | undefined
  }
  tableDraft: Partial<TableView>
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

export interface TableStandardSymbolLink {
  href: string
  text: string
}

export interface DatasourceHtmlTable {
  html: string | undefined
  numberHeadRows: string | undefined
  footnoteText: Array<string>
}

export interface HtmlTableRaw {
  table: {
    tbody: {
      tr: Array<HtmlTableRowRaw>
    }
  }
}
export interface HtmlTableRowRaw {
  td: Array<number | string | PreliminaryData>
}

export interface HtmlTable {
  table: {
    thead: {
      tr: {
        th: Array<number | string>
      }
    }
    tbody: {
      tr: Array<BodyCell>
    }
  }
}
export interface BodyCell {
  td: Array<number | string>
}

export interface TableView {
  caption?: Title
  thead: Array<TableRowUniform>
  tbody: Array<TableRowUniform>
  tfoot: {
    footnotes: Array<Note>
    correctionNotice: string
  }
  tableClass: string
  noteRefs: Array<string>
  sourceList: Source | TableSourceList | undefined
}

export type TableSourceList = Array<Source>
