import {Series, SeriesAndCategories} from '../highchartsData';
import {UtilLibrary} from '../../types/util';
import {
  HeaderCellUniform,
  PreliminaryData,
  TableCellUniform,
  TableRowUniform,
  TbmlDataUniform
} from '../../types/xmlParser';
import {SeriesLabelOptionsObject} from "highcharts";



const util: UtilLibrary = __non_webpack_require__('/lib/util')

const getRowValue = (value: object | number | string): number | string => {
  if (typeof value === 'object' && value.content != undefined) {
    return value.content
  }
  return value
}

export const seriesAndCategoriesFromTbml = (data: TbmlDataUniform, graphType: string, xAxisType: string): SeriesAndCategories => {
  const tbody: Array<TableRowUniform> = data.tbml.presentation.table.tbody
  const thead: Array<TableRowUniform> = data.tbml.presentation.table.thead
  const rows: TableRowUniform['tr'] = tbody[0].tr
  const headerRows: Array<TableCellUniform> = thead[0].tr
  const headers: HeaderCellUniform = headerRows[0].th
  let categories: HeaderCellUniform
  let series: Array<Series>
  if (graphType === 'pie') {
    categories = headers
    series = [{
      name: headers[0],
      data: rows.map((row) => {
        return {
          name: row.th,
          y: getRowValue(row.td[0])
        }
      })
    }]
  } else if ((graphType === 'area' || graphType === 'line') && xAxisType === 'linear') {
    categories = headers
    series = categories.map((cat: string, index: number) => {
      return {
        name: cat,
        data: rows.map((row) => {
          return [
            row.th,
            getRowValue(row.td[index])
          ]
        })
      }
    })
  } else {
    series = headers.map((name) => ({
      name,
      data: []
    }))
    rows.forEach((row) => {
      categories.push(row.th)
      series.forEach((serie, index) => {
        serie.data.push(getRowValue(util.data.forceArray(row.td)[index]))
      })
    })
  }

  return {
    categories,
    series,
    title: parseTitle(data.tbml.metadata)
  }
}


function parseTitle(metadata: TbmlMetaData): string | object | undefined {
  if (metadata.title && typeof(metadata.title) === 'string') {
    return metadata.title
  } else if (metadata.title && typeof(metadata.title) !== 'string' && metadata.title.content) {
    return metadata.title.content
  }
  return undefined
}

interface TbmlMetaData {
  title: string | {
    content: object;
  };
}
