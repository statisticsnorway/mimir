import { PreliminaryData, TbmlDataUniform } from '../../../types/xmlParser'
import { Request } from 'enonic-types/controller'
import { Highchart } from '../../../../site/content-types/highchart/highchart'
import { Content } from 'enonic-types/content'
import { JSONstat } from '../../../types/jsonstat-toolkit'
import { DataSource } from '../../../../site/mixins/dataSource/dataSource'
import { RowValue } from '../../utils/utils'

const {
  seriesAndCategoriesFromHtmlTable
} = __non_webpack_require__('/lib/ssb/parts/highcharts/data/htmlTable')
const {
  seriesAndCategoriesFromJsonStat
} = __non_webpack_require__('/lib/ssb/parts/highcharts/data/statBank')
const {
  seriesAndCategoriesFromTbml
} = __non_webpack_require__('/lib/ssb/parts/highcharts/data/tbProcessor')
const {
  DataSource: DataSourceType
} = __non_webpack_require__('/lib/ssb/repo/dataset')
const {
  data: {
    forceArray
  }
} = __non_webpack_require__('/lib/util')
const {
  getRowValue
} = __non_webpack_require__('/lib/ssb/utils/utils')

export function prepareHighchartsData(
  req: Request,
  highchartsContent: Content<Highchart>,
  data: JSONstat | TbmlDataUniform | object | string | undefined,
  dataSource: DataSource['dataSource']): SeriesAndCategories | undefined {
  const seriesAndCategories: SeriesAndCategories | undefined = getSeriesAndCategories(req, highchartsContent, data, dataSource)

  const seriesAndCategoriesOrData: SeriesAndCategories | undefined = seriesAndCategories && !seriesAndCategories.series ?
    addDataProperties(highchartsContent, seriesAndCategories) : seriesAndCategories

  return seriesAndCategoriesOrData !== undefined ?
    switchRowsAndColumnsCheck(highchartsContent, seriesAndCategoriesOrData) : seriesAndCategoriesOrData
}


export function getSeriesAndCategories(
  req: Request,
  highchart: Content<Highchart>,
  data: JSONstat | TbmlDataUniform | object | string | undefined,
  dataSource: DataSource['dataSource']): SeriesAndCategories | undefined {
  //
  if (dataSource && dataSource._selected === DataSourceType.STATBANK_API) {
    return seriesAndCategoriesFromJsonStat(req, highchart, data, dataSource)
  } else if (dataSource && (dataSource._selected === 'tbml' || dataSource._selected === DataSourceType.TBPROCESSOR)) {
    return seriesAndCategoriesFromTbml(data as TbmlDataUniform, highchart.data.graphType, highchart.data.xAxisType || 'linear')
  } else if (dataSource && dataSource._selected === DataSourceType.HTMLTABLE) {
    return seriesAndCategoriesFromHtmlTable(highchart)
  }
  return undefined
}

export function switchRowsAndColumnsCheck(
  highchartContent: Content<Highchart>,
  seriesAndCategories: SeriesAndCategories): SeriesAndCategories {
  //
  return (highchartContent.data.switchRowsAndColumns) ?
    switchRowsAndColumns(seriesAndCategories) : seriesAndCategories
}


function switchRowsAndColumns(seriesAndCategories: SeriesAndCategories ): SeriesAndCategories {
  const categories: Array<string | number> = forceArray(getRowValue(seriesAndCategories.categories))
  const series: Array<Series> = categories.reduce((series: Array<Series>, category, index: number) => {
    const serie: Series = {
      name: category,
      data: seriesAndCategories.series.map((serie) => {
        return serie.data[index]
      })
    }
    series.push(serie)
    return series
  }, [])

  return {
    categories: seriesAndCategories.series.map((serie) => serie.name),
    series: series
  }
}

export function addDataProperties(
  highchartContent: Content<Highchart>,
  seriesAndCategories: SeriesAndCategories): SeriesAndCategories {
  //
  return {
    ...seriesAndCategories,
    data: {
      switchRowsAndColumns: highchartContent.data.switchRowsAndColumns,
      decimalPoint: ',',
      table: 'highcharts-datatable-' + highchartContent._id
    }
  }
}

export interface HighchartsData {
  series: Array<{
    data: object;
    name: string;
  }>;
  categories: object;
}

export interface SeriesAndCategories {
  categories: Array<string | number | PreliminaryData>;
  series: Array<Series>;
  title?: string | object | undefined;
  data?: {
    switchRowsAndColumns: boolean;
    decimalPoint: string;
    table: string;
  };
}
export interface Series {
  name: string | number | PreliminaryData;
  data: Array<AreaLineLinearData | PieData | string | number>;
}

export type AreaLineLinearData = [number| string | Array<string | number | PreliminaryData>, RowValue]

export interface PieData {
  name: Array<string | number | PreliminaryData> | number | string;
  y: Array<number> | number | string;
}

export interface HighchartsDataLib {
  prepareHighchartsData: (
    req: Request,
    highchartsContent: Content<Highchart>,
    data: JSONstat | TbmlDataUniform | object | string | undefined,
    dataSource: DataSource['dataSource']) => SeriesAndCategories | undefined;
  getSeriesAndCategories: (
    req: Request,
    highchart: Content<Highchart>,
    data: JSONstat | TbmlDataUniform | object | string | undefined,
    dataSource: DataSource['dataSource']) => SeriesAndCategories | undefined;
  switchRowsAndColumnsCheck: (
    highchartContent: Content<Highchart>,
    seriesAndCategories: SeriesAndCategories) => SeriesAndCategories;
  addDataProperties: (
    highchartContent: Content<Highchart>,
    seriesAndCategories: SeriesAndCategories) => SeriesAndCategories;
}
