// @ts-ignore
import striptags from 'striptags'
import { Content } from '/lib/xp/content'
import { AreaLineLinearData, PieData, Series, SeriesAndCategories } from '/lib/ssb/parts/highcharts/highchartsData'
import { type XmlParser, type PreliminaryData, type TableRowUniform, type TableCellUniform } from '/lib/types/xmlParser'
import { type RowValue } from '/lib/types/util'
import { getRowValue } from '/lib/ssb/utils/utils'
import { toString } from '/lib/vendor/ramda'
import * as util from '/lib/util'
import { type RowData, type SeriesAndCategoriesRaw, type SeriesRaw, type Table } from '/lib/types/partTypes/highcharts'
import { type CombinedGraph, type Highchart } from '/site/content-types'

const xmlParser: XmlParser = __.newBean('no.ssb.xp.xmlparser.XmlParser')

export function seriesAndCategoriesFromHtmlTable(
  highChartsContent: Content<Highchart | CombinedGraph>
): SeriesAndCategories {
  const isCombinedGraph: boolean = highChartsContent.type === `${app.name}:combinedGraph`
  const htmlTable: string | undefined = isCombinedGraph
    ? (highChartsContent as Content<CombinedGraph>).data.dataSource?.htmlTable.html
    : (highChartsContent as Content<Highchart>).data.htmlTable
  let stringJson: string | undefined
  if (htmlTable) {
    const sanitized = striptags(htmlTable, ['table', 'thead', 'tbody', 'tr', 'th', 'td'])
    stringJson = __.toNativeObject(xmlParser.parse(sanitized))
  }
  const result: Table | undefined = stringJson ? JSON.parse(stringJson) : undefined
  const tbody: Array<TableRowUniform> = result ? util.data.forceArray(result.table.tbody) : []
  const rows: TableRowUniform['tr'] = tbody[0].tr
  const categories: Array<number | string> = rows.reduce(
    (previous: Array<number | string>, tr: RowData, index: number) => {
      const categoryValue: RowValue = getRowValue(tr.td[0])
      if (index > 0) previous.push(categoryValue)
      return previous
    },
    []
  )

  const dataInSeries: Array<SeriesRaw> = rows[0].td.reduce(
    (acc: Array<SeriesRaw>, current: number | string | PreliminaryData, tdIndex: number) => {
      const nameRow: RowValue = getRowValue(current)
      acc.push({
        name: typeof nameRow === 'number' ? toString(nameRow) : nameRow,
        data: rows.reduce((dataAcc: Array<number | string>, tr: TableCellUniform, trIndex: number) => {
          const value: RowValue = getRowValue(tr.td[tdIndex])
          if (trIndex > 0) dataAcc.push(typeof value === 'string' ? parseValue(value) : value)
          return dataAcc
        }, []),
      })
      return acc
    },
    []
  )

  dataInSeries.splice(0, 1)

  const graphType: string = isCombinedGraph ? 'combined' : (highChartsContent as Content<Highchart>).data.graphType

  const seriesAndCategories: SeriesAndCategories = convertToCorrectGraphFormat(
    {
      categories,
      series: dataInSeries,
    },
    graphType,
    highChartsContent.data.xAxisType
  )
  return seriesAndCategories
}

function parseValue(value: string): number | string {
  const number: string =
    typeof value === 'string'
      ? value
          .replace(',', '.')
          .replace(/&nbsp;/g, '')
          .replace(/ /g, '')
      : value
  return parseFloat(number)
}

function convertToCorrectGraphFormat(
  seriesAndCategories: SeriesAndCategoriesRaw,
  graphType: string,
  xAxisType: 'category' | 'linear' | 'logarithmic' | undefined
): SeriesAndCategories {
  if (graphType === 'pie') {
    return {
      categories: seriesAndCategories.categories,
      series: util.data.forceArray(dataFormatPie(seriesAndCategories)),
    }
  } else if ((graphType === 'area' || graphType === 'line') && xAxisType === 'linear') {
    return {
      categories: seriesAndCategories.categories,
      series: dataFormatAreaLineLinear(seriesAndCategories),
    }
  } else if (
    graphType === 'column' ||
    graphType === 'bar' ||
    graphType === 'barNegative' ||
    graphType === 'area' ||
    graphType === 'line'
  ) {
    return seriesAndCategories
  } else if (graphType === 'combined') {
    const series: Array<Series> = seriesAndCategories
      ? seriesAndCategories.series.map((row) => {
          return {
            name: row.name,
            data: row.data,
          }
        })
      : []
    return {
      categories: seriesAndCategories.categories,
      series,
    }
  } else {
    return {
      categories: seriesAndCategories.categories,
      series: util.data.forceArray(dataFormatDefault(seriesAndCategories)),
    }
  }
}

export function dataFormatDefault(seriesAndCategories: SeriesAndCategoriesRaw): Series {
  return {
    name: 'something',
    data: util.data.forceArray(seriesAndCategories.series[0].data[0]),
  }
}

function dataFormatAreaLineLinear(seriesAndCategories: SeriesAndCategoriesRaw): Array<Series> {
  return seriesAndCategories.categories.map((cat: string, index: number): Series => {
    return {
      name: cat,
      data: seriesAndCategories.series.map((row): AreaLineLinearData => {
        const name: number | string = row.name
        const rowValue: RowValue = getRowValue(util.data.forceArray(row.data)[index])

        return [name, rowValue]
      }),
    }
  })
}

function dataFormatPie(seriesAndCategories: SeriesAndCategoriesRaw): Series {
  if (seriesAndCategories.categories.length === 1) {
    return {
      name: seriesAndCategories.categories[0],
      data: seriesAndCategories.series.map(
        (serie): PieData => ({
          ...serie,
          y: serie.data[0],
        })
      ),
    }
  } else {
    return {
      name: seriesAndCategories.series[0].name,
      data: seriesAndCategories.categories.map((category, index): PieData => {
        return {
          name: category,
          y: seriesAndCategories.series[0].data[index],
        }
      }),
    }
  }
}
