import { SourceList } from '/lib/types/sources'
import { DropdownItems } from '/lib/types/components'

export interface TableProps {
  downloadTableLabel: string
  downloadTableTitle: object
  downloadTableOptions: DropdownItems
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

export interface TableStandardSymbolLink {
  href: string
  text: string
}
