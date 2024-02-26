import { Content } from '/lib/xp/content'
import { PreliminaryData, TbmlDataUniform } from '/lib/types/xmlParser'
import { JSONstat } from '/lib/types/jsonstat-toolkit'
import { RowValue, getRowValue } from '/lib/ssb/utils/utils'
import { seriesAndCategoriesFromHtmlTable } from '/lib/ssb/parts/highcharts/data/htmlTable'
import { seriesAndCategoriesFromJsonStat } from '/lib/ssb/parts/highcharts/data/statBank'
import { seriesAndCategoriesFromTbml } from '/lib/ssb/parts/highcharts/data/tbProcessor'
import { DataSource as DataSourceType } from '/lib/ssb/repo/dataset'
import * as util from '/lib/util'
import { type CombinedGraph, type Highchart } from '/site/content-types'
import { type DataSource } from '/site/mixins/dataSource'

export function prepareHighchartsData(
  req: XP.Request,
  highchartsContent: Content<Highchart>,
  data: JSONstat | TbmlDataUniform | object | string | undefined,
  dataSource: DataSource['dataSource']
): SeriesAndCategories | undefined {
  const seriesAndCategories: SeriesAndCategories | undefined = getSeriesAndCategories(
    req,
    highchartsContent,
    data,
    dataSource
  )

  const seriesAndCategoriesOrData: SeriesAndCategories | undefined =
    seriesAndCategories && !seriesAndCategories.series
      ? addDataProperties(highchartsContent, seriesAndCategories)
      : seriesAndCategories

  return seriesAndCategoriesOrData !== undefined
    ? switchRowsAndColumnsCheck(highchartsContent, seriesAndCategoriesOrData)
    : seriesAndCategoriesOrData
}

export function getSeriesAndCategories(
  req: XP.Request,
  highchart: Content<Highchart>,
  data: JSONstat | TbmlDataUniform | object | string | undefined,
  dataSource: DataSource['dataSource']
): SeriesAndCategories | undefined {
  if (dataSource && dataSource._selected === DataSourceType.STATBANK_API) {
    return seriesAndCategoriesFromJsonStat(req, highchart, data, dataSource)
  } else if (dataSource && dataSource._selected === DataSourceType.TBPROCESSOR) {
    return seriesAndCategoriesFromTbml(
      data as TbmlDataUniform,
      highchart.data.graphType,
      highchart.data.xAxisType || 'linear'
    )
  } else if (highchart.data.htmlTable) {
    return seriesAndCategoriesFromHtmlTable(highchart)
  }
  return undefined
}

export function prepareCombinedGraphData(combinedGraph: Content<CombinedGraph>): SeriesAndCategories | undefined {
  log.info('\x1b[32m%s\x1b[0m', '3. prepareCombinedGraphData')
  if (combinedGraph.data.dataSource && combinedGraph.data.dataSource._selected === DataSourceType.HTMLTABLE) {
    return seriesAndCategoriesFromHtmlTable(combinedGraph)
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
    switchRowsAndColumns?: boolean
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
