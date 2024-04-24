export interface XmlParser {
  parse: (xml: string) => string
}

export interface TbmlDataRaw {
  tbml: {
    presentation: {
      table: TableRaw
    }
    metadata: MetadataRaw
  }
}

export interface StatbankSavedRaw {
  html: string
  json: string
}

export interface StatbankSavedUniform {
  table: {
    thead: TableRowRaw | Array<TableRowRaw>
    tbody: TableRowRaw | Array<TableRowRaw>
    caption: Title
    id: string
  }
}

export interface TableRaw {
  tbody: TableRowRaw | Array<TableRowRaw>
  thead: TableRowRaw | Array<TableRowRaw>
  class: string
}

export interface TableRowRaw {
  tr: TableCellRaw | Array<TableCellRaw>
}

export interface TableCellRaw extends HeaderCellRaw, DataCellRaw {}

export interface HeaderCellRaw {
  th: Array<string> | number | string | PreliminaryData
}

export interface DataCellRaw {
  td: Array<number> | Array<string> | number | string | PreliminaryData
}

export interface MetadataRaw {
  instance: {
    publicRelatedTableIds?: string | number
    'xml:lang': string
    relatedTableIds: string
    definitionId: number
  }
  tablesource: string
  title: string | Title
  category: string
  shortnameweb: string
  tags: string
  notes?: Notes
  sourceList: Source | Array<Source>
}

export interface TbmlSourceListRaw {
  sourceList: {
    tbml: {
      id: number
      source: Source | Array<Source>
    }
  }
}

export interface TbmlDataUniform {
  tbml: {
    presentation: {
      table: TableUniform
    }
    metadata: MetadataUniform
  }
}

export interface TableUniform {
  thead: Array<TableRowUniform>
  tbody: Array<TableRowUniform>
  class: string
}

export interface TableRowUniform {
  tr: Array<TableCellUniform>
}

export interface TableCellUniform {
  th: Array<number | string | PreliminaryData>
  td: Array<number | string | PreliminaryData>
}
export interface MetadataUniform {
  instance: {
    publicRelatedTableIds: Array<string>
    language: string
    relatedTableIds: Array<string>
    definitionId: number | string
  }
  tablesource: string
  title: Title
  category: string
  shortnameweb: string
  tags: string
  notes: NotesUniform
  sourceList?: Array<Source>
  sourceListStatus?: number
}

export interface NotesUniform {
  note: Array<Note>
}

export interface TbmlSourceListUniform {
  sourceList: {
    tbml: {
      id: number | string
      source: Array<Source>
    }
  }
}

export interface TbmlData {
  tbml: {
    presentation: {
      table: Table
    }
    metadata: Metadata
  }
}

export interface Metadata {
  instance: {
    publicRelatedTableIds?: string | number
    'xml:lang': string
    relatedTableIds: string
    definitionId: number | string
  }
  tablesource: string
  title: Title
  category: string
  tags: string
  notes?: Notes
  sourceList: Source | Array<Source>
}

export interface TbmlSourceList {
  sourceList: {
    tbml: {
      id: number | string
      source: Source | Array<Source>
    }
  }
}

export interface Source {
  owner: number | string
  tableApproved: string
  tableId: string
  id: string
  table: string
}

export interface Notes {
  note: Array<Note> | Note
}

export interface Note {
  noteid: string
  content: string
}

export interface Title {
  noterefs: string
  content: string
}

interface Table {
  tbody: {
    tr: Array<TableRow>
  }
  thead: Thead | Array<Thead>
  class: string
}

export interface Thead {
  tr: TableRow | Array<TableRow>
}

export interface TableRow {
  th: Array<string> | number | string
  td: Array<number> | number | string | PreliminaryData
}

export interface PreliminaryData {
  class: string
  content: number | string
  noterefs: string
  rowspan?: number
  colspan?: number
  strong?: number | string
}
