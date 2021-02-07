import { PreliminaryData, TbmlDataUniform } from '../types/xmlParser'
import { Request } from 'enonic-types/controller'
import { Highchart } from '../../site/content-types/highchart/highchart'
import { Content } from 'enonic-types/content'
import { JSONstat } from '../types/jsonstat-toolkit'
import { DataSource } from '../../site/mixins/dataSource/dataSource'
import { UtilLibrary } from '../types/util'

const util: UtilLibrary = __non_webpack_require__('/lib/util')
const {
  seriesAndCategoriesFromHtmlTable
} = __non_webpack_require__( '/lib/highcharts/data/htmlTable')
const {
  seriesAndCategoriesFromJsonStat
} = __non_webpack_require__( '/lib/highcharts/data/statBank')
const {
  seriesAndCategoriesFromTbml
} = __non_webpack_require__( '/lib/highcharts/data/tbProcessor')
const {
  DataSource: DataSourceType
} = __non_webpack_require__( '/lib/repo/dataset')

export function prepareHighchartsData(
  req: Request,
  highchartsContent: Content<Highchart>,
  data: JSONstat | TbmlDataUniform | object | string | undefined,
  dataSource: DataSource['dataSource']): SeriesAndCategories | undefined {
  //
  const seriesAndCategories: SeriesAndCategories | undefined = getSeriesAndCategories(req, highchartsContent, data, dataSource)

  const seriesAndCategoriesOrData: SeriesAndCategories | undefined = seriesAndCategories && !seriesAndCategories.series ?
    addDataProperties(highchartsContent, seriesAndCategories) : seriesAndCategories

  return seriesAndCategoriesOrData !== undefined ?
    switchRowsAndColumnsCheck(highchartsContent, seriesAndCategoriesOrData, dataSource) : seriesAndCategoriesOrData
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
    return seriesAndCategoriesFromTbml(data, highchart.data.graphType, highchart.data.xAxisType)
  } else if (dataSource && dataSource._selected === DataSourceType.HTMLTABLE) {
    return seriesAndCategoriesFromHtmlTable(highchart)
  }
  return undefined
}

export function switchRowsAndColumnsCheck(
  highchartContent: Content<Highchart>,
  seriesAndCategories: SeriesAndCategories,
  dataSource: DataSource['dataSource']) {
  //
  return (dataSource && !dataSource._selected === DataSourceType.STATBANK_API && highchartContent.data.graphType === 'pie' ||
    highchartContent.data.switchRowsAndColumns) ?
    switchRowsAndColumns(seriesAndCategories) : seriesAndCategories
}


function switchRowsAndColumns(seriesAndCategories: SeriesAndCategories ): SeriesAndCategories {
  const categories: Array<string | number | PreliminaryData> = util.data.forceArray(seriesAndCategories.categories)
  const series: Array<Series> = categories.reduce((series: Array<Series>, category: string | number | PreliminaryData, index: number) => {
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
  data: Array<AreaLineLinearData | PieData>;
}

export type AreaLineLinearData = Array<[ number| string, Array<number> ]>

export interface PieData {
  name: Array<string | number | PreliminaryData>;
  y: Array<number>;
}


