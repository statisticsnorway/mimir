import { type PreliminaryData, type TableRowUniform } from '../xmlParser'

export interface Table {
  table: {
    tbody: Array<TableRowUniform>
  }
}

export interface RowData {
  td: Array<number | string | PreliminaryData>
}

export interface SeriesRaw {
  name: string
  data: Array<number | string>
}

export interface SeriesAndCategoriesRaw {
  categories: Array<number | string>
  series: Array<SeriesRaw>
}
