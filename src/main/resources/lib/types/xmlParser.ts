export interface XmlParser {
  parse: (xml: string) => TbmlData;
}

export interface TbmlData {
  tbml: {
    presentation: {
      table: Table;
    };
    metadata: Metadata;
  };
}

interface Metadata {
  instance: {
    publicRelatedTableIds: string;
    'xml:lang': string;
    relatedTableIds: string;
    definitionId: number;
  };
  tablesource: string;
  title: string;
  category: string;
  tags: string;
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

interface TableRow {
  th: string;
  td: Array<number>;
}
