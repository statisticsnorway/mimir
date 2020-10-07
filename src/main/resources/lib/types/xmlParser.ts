export interface XmlParser {
  parse: (xml: string) => string;
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
  thead: {
    tr: TableRow;
  };
  class: string;
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
