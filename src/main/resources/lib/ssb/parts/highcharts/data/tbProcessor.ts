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
  const headers: TableCellUniform['th'] = headerRows[0].th
  const categories: TableCellUniform['th'] = determineCategories(graphType, headers, rows, xAxisType)
  const series: Array<Series> = determineSeries(graphType, headers, categories, rows, xAxisType)

  return {
    categories,
    series,
    title: data.tbml.metadata.title,
  }
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
        const cellValue = util.data.forceArray(row.td)[index]
        if (cellValue !== undefined && cellValue !== null) {
          serie.data.push(getRowValue(cellValue))
        }
      })
    })
    const filteredSeries = series.filter((serie) => serie.data.length > 0)
    if (filteredSeries.length === 1 && headers.length > 1) {
      return [
        {
          name: headers[1],
          data: filteredSeries[0].data,
        },
      ]
    }
    return filteredSeries
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
