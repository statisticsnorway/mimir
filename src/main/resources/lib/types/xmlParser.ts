export interface XmlParser {
  parse: (xml: string) => string;
}

export interface TbmlDataRaw {
  tbml: {
    presentation: {
      table: TableRaw;
    };
    metadata: MetadataRaw;
  };
}

export interface TableRaw {
  tbody: TableRowRaw | Array<TableRowRaw>;
  thead: TableRowRaw | Array<TableRowRaw>;
  class: string;
}

export interface TableRowRaw {
  tr: TableCellRaw | Array<TableCellRaw>;
}

export interface TableCellRaw {
  th: HeaderCellRaw;
  td: DataCellRaw;
}

export interface HeaderCellRaw {
  th: Array<string> | number | string;
}

export interface DataCellRaw {
  td: Array<number> | Array<string> | number | string | PreliminaryData;
}

export interface MetadataRaw {
  instance: {
    publicRelatedTableIds?: string | number;
    'xml:lang': string;
    relatedTableIds: string;
    definitionId: number;
  };
  tablesource: string;
  title: string | Title;
  category: string;
  tags: string;
  notes?: Notes;
  sourceList: Source | Array<Source>;
}

export interface TbmlData {
  tbml: {
    presentation: {
      table: Table;
    };
    metadata: Metadata;
  };
}

export interface Metadata {
  instance: {
    publicRelatedTableIds?: string | number;
    'xml:lang': string;
    relatedTableIds: string;
    definitionId: number;
  };
  tablesource: string;
  title: Title;
  category: string;
  tags: string;
  notes?: Notes;
  sourceList: Source | Array<Source>;
}

export interface TbmlSourceList {
  sourceList: {
    tbml: {
      id: number;
      source: Source | Array<Source>;
    };
  };
}

export interface Source {
  owner: number;
  tableApproved: string;
  tableId: string;
  id: string;
  table: string;
}

export interface Notes {
  note: Array<Note> | Note;
}

export interface Note {
  noteid: string;
  content: string;
}

export interface Title {
  noterefs: string;
  content: string;
}

interface Table {
  tbody: {
    tr: Array<TableRow>;
  };
  thead: Thead | Array<Thead>;
  class: string;
}

export interface Thead {
  tr: TableRow | Array<TableRow>;
}

export interface TableRow {
  th: Array<string> | number | string;
  td: Array<number> | number | string | PreliminaryData;
}

export interface PreliminaryData {
  class: string;
  content: number;
  noterefs: string;
}
