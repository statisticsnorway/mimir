import { Content } from '/lib/xp/content'
import { type HighchartsGraphConfig } from '/lib/types/highcharts'
import { type PreliminaryData } from '/lib/types/xmlParser'
import * as util from '/lib/util'
import { createDefaultConfig } from '/lib/ssb/parts/highcharts/graph/config'
import { areaConfig } from '/lib/ssb/parts/highcharts/graph/graphAreaConfig'
import { pieConfig } from '/lib/ssb/parts/highcharts/graph/graphPieConfig'
import { barConfig } from '/lib/ssb/parts/highcharts/graph/graphBarConfig'
import { barNegativeConfig } from '/lib/ssb/parts/highcharts/graph/graphBarNegativeConfig'
import { columnConfig } from '/lib/ssb/parts/highcharts/graph/graphColumnConfig'
import { lineConfig } from '/lib/ssb/parts/highcharts/graph/graphLineConfig'
import { combinedGraphConfig, type GetCombinedGraphOptions } from '/lib/ssb/parts/highcharts/graph/combinedGraphConfig'
import { DataSource as DataSourceType } from '/lib/ssb/repo/dataset'
import { mergeDeepRight } from '/lib/vendor/ramda'
import { Series } from '/lib/ssb/parts/highcharts/highchartsData'
import { type DataSource } from '/site/mixins/dataSource'
import { type CombinedGraph, type Highchart } from '/site/content-types'

export function prepareHighchartsGraphConfig(
  highchartContent: Content<Highchart>,
  dataFormat: DataSource['dataSource'],
  categories: Array<string | number | PreliminaryData> | undefined = undefined
): HighchartsGraphConfig {
  const isJsonStat: boolean =
    dataFormat !== undefined &&
    dataFormat._selected !== undefined &&
    dataFormat._selected === DataSourceType.STATBANK_API

  const options: GetGraphOptions = {
    isJsonStat,
    xAxisLabel:
      isJsonStat && dataFormat && dataFormat._selected === DataSourceType.STATBANK_API
        ? dataFormat['statbankApi'].xAxisLabel
        : undefined,
    categories,
  }
  return getGraphConfig(highchartContent, options)
}

export function prepareCombinedGraphConfig(
  combinedGraphContent: Content<CombinedGraph>,
  categories: Array<string | number | PreliminaryData> | undefined,
  series: Array<Series> | undefined
): HighchartsGraphConfig {
  const defaultConfig = createDefaultConfig(
    combinedGraphContent.data,
    combinedGraphContent.displayName,
    combinedGraphContent.language
  )

  const yAxis = util.data.forceArray(combinedGraphContent.data.yAxis!).map((data, index) => {
    const yAxisConfig = {
      title: {
        text: data?.yAxisTitle,
        offset: data.yAxisOffset ? parseFloat(data.yAxisOffset) : 0,
      },
      opposite: index === 1 ? true : undefined,
      allowDecimals: data.yAxisDecimalPlaces ? Number(data.yAxisDecimalPlaces) > 0 : undefined,
      labels: {
        format: `{value:,.${data.yAxisDecimalPlaces || 0}f}`,
      },
      min: data.yAxisMin && !isNaN(parseFloat(data.yAxisMin)) ? parseFloat(data.yAxisMin) : undefined,
      max: data.yAxisMax && !isNaN(parseFloat(data.yAxisMax)) ? parseFloat(data.yAxisMax) : undefined,
    }
    return mergeDeepRight(defaultConfig.yAxis, yAxisConfig)
  })

  const seriesOption = series
    ? util.data.forceArray(combinedGraphContent.data.series!).map((data, index) => {
        return {
          type: data.graphType,
          data: series[index].data,
          name: series[index].name,
          yAxis: data.yAxis && Number(data.yAxis) === 2 ? 1 : undefined,
        }
      })
    : []

  const combinedOptions: GetCombinedGraphOptions = {
    series: seriesOption,
    yAxis,
    categories,
  }
  return combinedGraphConfig(combinedGraphContent, combinedOptions)
}

function getGraphConfig(highchartContent: Content<Highchart>, options: GetGraphOptions): HighchartsGraphConfig {
  switch (highchartContent.data.graphType) {
    case 'area':
      return areaConfig(highchartContent, options)
    case 'bar':
      return barConfig(highchartContent, options)
    case 'barNegative':
      return barNegativeConfig(highchartContent, options)
    case 'column':
      return columnConfig(highchartContent, options)
    case 'line':
      return lineConfig(highchartContent, options)
    case 'pie':
      return pieConfig(highchartContent, options)
    default:
      return defaultConfig(highchartContent)
  }
}

function defaultConfig(highchartsContent: Content<Highchart>): HighchartsGraphConfig {
  return createDefaultConfig(highchartsContent.data, highchartsContent.displayName, highchartsContent.language)
}

interface GetGraphOptions {
  isJsonStat: boolean
  xAxisLabel: string | undefined
  categories: object | undefined
}
