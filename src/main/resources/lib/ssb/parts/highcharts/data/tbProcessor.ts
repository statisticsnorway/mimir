import { AreaLineLinearData, Series, SeriesAndCategories } from '/lib/ssb/parts/highcharts/highchartsData'
import {
  type PreliminaryData,
  type TableCellUniform,
  type TableRowUniform,
  type TbmlDataUniform,
} from '/lib/types/xmlParser'
import { type RowValue } from '/lib/types/util'
import { getRowValue } from '/lib/ssb/utils/utils'
import { getColumnHeaderRowFromThead, getTimePeriodFromThead } from '/lib/ssb/parts/highcharts/data/theadUtils'
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
  const columnHeaderRow = getColumnHeaderRowFromThead(thead)
  const headers: TableCellUniform['th'] = columnHeaderRow ? getHeaders(columnHeaderRow, tbody) : []
  const categories: TableCellUniform['th'] = determineCategories(graphType, headers, rows, xAxisType)
  const series: Array<Series> = determineSeries(graphType, headers, categories, rows, xAxisType)

  const timePeriod = getTimePeriodFromThead(thead)

  return {
    categories,
    series,
    title: data.tbml.metadata.title,
    timePeriod: timePeriod,
  }
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
