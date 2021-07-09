import { AreaLineLinearData, PieData, Series, SeriesAndCategories } from '../highchartsData'
import { XmlParser, PreliminaryData, TableRowUniform, TableCellUniform } from '../../../../types/xmlParser'
import { Content } from 'enonic-types/content'
import { Highchart } from '../../../../../site/content-types/highchart/highchart'
import { RowValue } from '../../../utils/utils'

const {
  toString
} = __non_webpack_require__('/lib/vendor/ramda')
const {
  data: {
    forceArray
  }
} = __non_webpack_require__('/lib/util')
const xmlParser: XmlParser = __.newBean('no.ssb.xp.xmlparser.XmlParser')
const {
  getRowValue
} = __non_webpack_require__('/lib/ssb/utils/utils')

export function seriesAndCategoriesFromHtmlTable(highChartsContent: Content<Highchart>): SeriesAndCategories {
  const stringJson: string | undefined = highChartsContent.data.htmlTable ? __.toNativeObject(xmlParser.parse(highChartsContent.data.htmlTable)) : undefined
  const result: Table | undefined = stringJson ? JSON.parse(stringJson) : undefined
  const tbody: Array<TableRowUniform> = result ? forceArray(result.table.tbody) : []
  const rows: TableRowUniform['tr'] = tbody[0].tr
  const categories: Array<number | string> = rows.reduce((previous: Array<number | string>, tr: RowData, index: number) => {
    const categoryValue: RowValue = getRowValue(tr.td[0])
    if (index > 0) previous.push(categoryValue)
    return previous
  }, [])

  const dataInSeries: Array<SeriesRaw> = rows[0].td.reduce( (
    acc: Array<SeriesRaw>,
    current: number | string | PreliminaryData,
    tdIndex: number) => {
    const nameRow: RowValue = getRowValue(current)
    acc.push({
      name: typeof nameRow === 'number' ? toString(nameRow) : nameRow,
      data: rows.reduce( (
        dataAcc: Array<number | string>,
        tr: TableCellUniform,
        trIndex: number
      ) => {
        const value: RowValue = getRowValue(tr.td[tdIndex])
        if (trIndex > 0) dataAcc.push(typeof(value) === 'string' ? parseValue(value) : value)
        return dataAcc
      }, [])
    })
    return acc
  }, [])

  dataInSeries.splice(0, 1) // remove the first because its garbage

  const seriesAndCategories: SeriesAndCategories = convertToCorrectGraphFormat({
    categories,
    series: dataInSeries
  }, highChartsContent.data.graphType, highChartsContent.data.xAxisType)

  return seriesAndCategories
}

function parseValue(value: string): number | string {
  const number: string = typeof(value) === 'string' ?
    value.replace(',', '.')
      .replace(/&nbsp;/g, '')
      .replace(' ', '') :
    value

  return parseFloat(number)
}

function convertToCorrectGraphFormat(
  seriesAndCategories: SeriesAndCategoriesRaw,
  graphType: string,
  xAxisType: 'category' | 'linear' | 'logarithmic' | undefined): SeriesAndCategories {
  if (graphType === 'pie') {
    return {
      categories: seriesAndCategories.categories,
      series: forceArray(dataFormatPie(seriesAndCategories))
    }
  } else if ((graphType === 'area' || graphType === 'line') && xAxisType === 'linear') {
    return {
      categories: seriesAndCategories.categories,
      series: dataFormatAreaLineLinear(seriesAndCategories)
    }
  } else if (graphType === 'column' || graphType === 'bar' ||
      graphType === 'barNegative' || graphType === 'area' || graphType === 'line') {
    return seriesAndCategories
  } else {
    return {
      categories: seriesAndCategories.categories,
      series: forceArray(dataFormatDefault(seriesAndCategories)
      )
    }
  }
}

export function dataFormatDefault(seriesAndCategories: SeriesAndCategoriesRaw): Series {
  return {
    name: 'something',
    data: forceArray(seriesAndCategories.series[0].data[0])
  }
}

function dataFormatAreaLineLinear(seriesAndCategories: SeriesAndCategoriesRaw): Array<Series> {
  return seriesAndCategories.categories.map((cat: string, index: number): Series => {
    return {
      name: cat,
      data: seriesAndCategories.series.map((row): AreaLineLinearData => {
        const name: number | string = row.name
        const rowValue: RowValue = getRowValue(forceArray(row.data)[index])

        return [
          name,
          rowValue
        ]
      })
    }
  })
}

function dataFormatPie(seriesAndCategories: SeriesAndCategoriesRaw): Series {
  if (seriesAndCategories.categories.length === 1) {
    return {
      name: 'Antall',
      data: seriesAndCategories.series.map((serie): PieData => ({
        ...serie,
        y: serie.data[0]
      }))
    }
  } else {
    return {
      name: 'Antall',
      data: seriesAndCategories.categories.map((category, index): PieData => {
        return {
          name: category,
          y: seriesAndCategories.series[0].data[index]
        }
      })
    }
  }
}

interface Table {
  table: {
    tbody: Array<TableRowUniform>;
  };
}

interface RowData {
  td: Array<number | string | PreliminaryData>;
}

export interface SeriesRaw {
  name: string;
  data: Array<number | string>;
}

interface SeriesAndCategoriesRaw {
  categories: Array<number | string>;
  series: Array<SeriesRaw>;
}

export interface HighchartsHtmlTableLib {
  seriesAndCategoriesFromHtmlTable: (highChartsContent: Content<Highchart>) => SeriesAndCategories;
  dataFormatDefault: (seriesAndCategories: SeriesAndCategoriesRaw) => Series;
}
