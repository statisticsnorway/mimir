import { Content } from '/lib/xp/content'
import { type PreliminaryData, type TbmlDataUniform } from '/lib/types/xmlParser'
import { type JSONstat } from '/lib/types/jsonstat-toolkit'
import { type RowValue } from '/lib/types/util'
import { getRowValue } from '/lib/ssb/utils/utils'
import { seriesAndCategoriesFromHtmlTable } from '/lib/ssb/parts/highcharts/data/htmlTable'
import { seriesAndCategoriesFromJsonStat } from '/lib/ssb/parts/highcharts/data/statBank'
import { seriesAndCategoriesFromTbml } from '/lib/ssb/parts/highcharts/data/tbProcessor'
import { DataSource as DataSourceType } from '/lib/ssb/repo/dataset'
import * as util from '/lib/util'
import { type CombinedGraph, type Highchart } from '/site/content-types'
import { type DataSource } from '/site/mixins/dataSource'

export function prepareHighchartsData(
  req: XP.Request,
  highchartsContent: Content<Highchart | CombinedGraph>,
  data: JSONstat | TbmlDataUniform | object | string | undefined,
  dataSource: DataSource['dataSource']
): SeriesAndCategories | undefined {
  const seriesAndCategories: SeriesAndCategories | undefined = getSeriesAndCategories(
    req,
    highchartsContent,
    data,
    dataSource
  )
  if (highchartsContent.type === `${app.name}:combinedGraph`) {
    return seriesAndCategories
  }
  const seriesAndCategoriesOrData: SeriesAndCategories | undefined =
    seriesAndCategories && !seriesAndCategories.series
      ? addDataProperties(highchartsContent as Content<Highchart>, seriesAndCategories)
      : seriesAndCategories

  return seriesAndCategoriesOrData !== undefined
    ? switchRowsAndColumnsCheck(highchartsContent as Content<Highchart>, seriesAndCategoriesOrData)
    : seriesAndCategoriesOrData
}

export function getSeriesAndCategories(
  req: XP.Request,
  highchart: Content<Highchart | CombinedGraph>,
  data: JSONstat | TbmlDataUniform | object | string | undefined,
  dataSource: DataSource['dataSource']
): SeriesAndCategories | undefined {
  if (dataSource && dataSource._selected === DataSourceType.STATBANK_API) {
    return seriesAndCategoriesFromJsonStat(req, highchart, data, dataSource)
  } else if (dataSource && dataSource._selected === DataSourceType.TBPROCESSOR) {
    return seriesAndCategoriesFromTbml(
      data as TbmlDataUniform,
      (highchart as Content<Highchart>).data.graphType,
      highchart.data.xAxisType || 'linear'
    )
  } else if (
    (highchart as Content<Highchart>).data.htmlTable ||
    (highchart.data.dataSource && highchart.data.dataSource._selected === DataSourceType.HTMLTABLE)
  ) {
    return seriesAndCategoriesFromHtmlTable(highchart)
  }
  return undefined
}

export function switchRowsAndColumnsCheck(
  highchartContent: Content<Highchart>,
  seriesAndCategories: SeriesAndCategories
): SeriesAndCategories {
  //
  return highchartContent.data.switchRowsAndColumns ? switchRowsAndColumns(seriesAndCategories) : seriesAndCategories
}

function switchRowsAndColumns(seriesAndCategories: SeriesAndCategories): SeriesAndCategories {
  const categories: Array<string | number> = util.data.forceArray(getRowValue(seriesAndCategories.categories))
  const series: Array<Series> = categories.reduce((series: Array<Series>, category, index: number) => {
    const serie: Series = {
      name: category,
      data: seriesAndCategories.series.map((serie) => {
        return serie.data[index]
      }),
    }
    series.push(serie)
    return series
  }, [])

  return {
    categories: seriesAndCategories.series.map((serie) => serie.name),
    series: series,
  }
}

export function addDataProperties(
  highchartContent: Content<Highchart>,
  seriesAndCategories: SeriesAndCategories
): SeriesAndCategories {
  //
  return {
    ...seriesAndCategories,
    data: {
      switchRowsAndColumns: highchartContent.data.switchRowsAndColumns,
      decimalPoint: ',',
      table: 'highcharts-datatable-' + highchartContent._id,
    },
  }
}

export interface HighchartsData {
  series: Array<{
    data: object
    name: string
  }>
  categories: object
}

export interface SeriesAndCategories {
  categories: Array<string | number | PreliminaryData>
  series: Array<Series>
  title?: string | object | undefined
  data?: {
    switchRowsAndColumns: boolean
    decimalPoint: string
    table: string
  }
}
export interface Series {
  name: string | number | PreliminaryData
  data: Array<AreaLineLinearData | PieData | string | number>
}

export type AreaLineLinearData = [number | string | Array<string | number | PreliminaryData>, RowValue]

export interface PieData {
  name: Array<string | number | PreliminaryData> | number | string
  y: Array<number> | number | string
}
