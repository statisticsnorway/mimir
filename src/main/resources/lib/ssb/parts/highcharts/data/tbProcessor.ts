import { AreaLineLinearData, Series, SeriesAndCategories } from '/lib/ssb/parts/highcharts/highchartsData'
import {
  type PreliminaryData,
  type TableCellUniform,
  type TableRowUniform,
  type TbmlDataUniform,
} from '/lib/types/xmlParser'
import { type RowValue } from '/lib/types/util'
import { getRowValue } from '/lib/ssb/utils/utils'
import * as util from '/lib/util'

export function seriesAndCategoriesFromTbml(
  data: TbmlDataUniform,
  graphType: string,
  xAxisType: string
): SeriesAndCategories {
  //
  const tbody: Array<TableRowUniform> = data.tbml.presentation.table.tbody
  const thead: Array<TableRowUniform> = data.tbml.presentation.table.thead
  const rows: TableRowUniform['tr'] = tbody[0].tr
  const headerRows: Array<TableCellUniform> = thead[0].tr
  const columnHeaderRow = getColumnHeaderRow(headerRows)
  const headers: TableCellUniform['th'] = columnHeaderRow ? getHeaders(columnHeaderRow, tbody) : []
  const categories: TableCellUniform['th'] = determineCategories(graphType, headers, rows, xAxisType)
  const series: Array<Series> = determineSeries(graphType, headers, categories, rows, xAxisType)

  const timePeriod = getHeaderSubtitle(thead[0].tr)

  return {
    categories,
    series,
    title: data.tbml.metadata.title,
    timePeriod: timePeriod,
  }
}

function getColumnHeaderRow(headerRows: TableCellUniform[]): TableCellUniform | undefined {
  // Use the second header row if the first one only contains a grouped header (colspan),
  // otherwise fall back to the first row (default case).
  if (!headerRows?.length) return undefined

  const first = headerRows[0]
  const second = headerRows[1]

  if (second && rowHasColspanGroupHeader(first)) {
    return second
  }

  return first
}

function rowHasColspanGroupHeader(row: TableCellUniform): boolean {
  if (!Array.isArray(row.th)) return false
  return row.th.some((cell) => isPreliminaryDataCell(cell) && Number(cell.colspan) > 1)
}

function isPreliminaryDataCell(cell: unknown): cell is PreliminaryData {
  return typeof cell === 'object' && cell !== null && 'content' in cell
}

function getHeaders(headerRow: TableCellUniform, body: Array<TableRowUniform>): TableCellUniform['th'] {
  const th = util.data.forceArray(headerRow.th)
  const td = util.data.forceArray(headerRow.td)

  // Table without td in thead (e.g. some Dapla tables).
  // If the header row includes an extra first column (row-label header), drop it.
  if ((!td || td.length === 0) && th.length > 1) {
    const firstBodyRow = body?.[0]?.tr?.[0]
    const bodyTdCount = firstBodyRow ? util.data.forceArray(firstBodyRow.td).length : 0

    if (bodyTdCount > 0 && th.length === bodyTdCount + 1) {
      return th.slice(1)
    }
  }

  return th
}

function determineSeries(
  graphType: string,
  headers: TableCellUniform['th'],
  categories: TableCellUniform['th'],
  rows: TableRowUniform['tr'],
  xAxisType: string
): Array<Series> {
  //
  if (graphType === 'pie') {
    return [
      {
        name: headers[0],
        data: rows.map((row: TableCellUniform) => {
          return {
            name: row.th,
            y: getRowValue(row.td[0]),
          }
        }),
      },
    ]
  } else if ((graphType === 'area' || graphType === 'line') && xAxisType === 'linear') {
    return categories.map((cat: number | string | PreliminaryData, index: number): Series => {
      const name: RowValue = getRowValue(cat) as string
      return {
        name,
        data: rows.map((row: TableCellUniform): AreaLineLinearData => {
          return [row.th, getRowValue(row.td[index])]
        }),
      }
    })
  } else {
    const series: Array<Series> = headers.map((name) => ({
      name: typeof name === 'number' ? name.toString() : name,
      data: [],
    }))
    rows.forEach((row: TableCellUniform) => {
      series.forEach((serie, index) => {
        serie.data.push(getRowValue(util.data.forceArray(row.td)[index]))
      })
    })
    return series
  }
}

function determineCategories(
  graphType: string,
  headers: TableCellUniform['th'],
  rows: TableRowUniform['tr'],
  xAxisType: string
): TableCellUniform['th'] {
  /**/
  if (graphType === 'pie' || ((graphType === 'area' || graphType === 'line') && xAxisType === 'linear')) {
    return headers
  } else {
    return rows.map((row) => row.th[0])
  }
}

function getHeaderSubtitle(rows: TableCellUniform[]): string | undefined {
  for (const row of rows) {
    if (!hasHeaderObjects(row)) continue

    for (const cell of row.th) {
      const colspan = Number(cell.colspan)
      if (colspan > 1) {
        const text = cell.content == null ? '' : String(cell.content).trim()
        return text || undefined
      }
    }
  }
  return undefined
}

function hasHeaderObjects(row: TableCellUniform): row is TableCellUniform & { th: PreliminaryData[] } {
  return (
    Array.isArray(row.th) &&
    row.th.some((cell): cell is PreliminaryData => typeof cell === 'object' && cell !== null && 'content' in cell)
  )
}
