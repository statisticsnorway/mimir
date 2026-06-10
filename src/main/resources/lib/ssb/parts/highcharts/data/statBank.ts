import { type Content } from '@enonic-types/lib-portal'
import { getMunicipality } from '/lib/ssb/dataset/klass/municipalities'
import { DataSource as DataSourceType } from '/lib/ssb/repo/dataset'
import { type Dimension, type Dataset, type Category, type Data } from '/lib/types/jsonstat-toolkit'
import { type RequestWithCode, type MunicipalityWithCounty } from '/lib/types/municipalities'
import { type Highchart, type CombinedGraph } from '/site/content-types'
import { type DataSource } from '/site/mixins/dataSource'
import { SeriesAndCategories } from '../highchartsData'

type HighchartsValue = number | string | null

const getHighchartsValue = (value: ReturnType<Dataset['Data']>): HighchartsValue => {
  if (typeof value === 'number' || typeof value === 'string') {
    return value
  }

  const data = value as Data
  return Array.isArray(data.value) ? (data.value[0] ?? null) : null
}

const getDimension = (dataset: Dataset, dimensionId: string): Dimension | null => {
  const dimension = dataset.Dimension(dimensionId)
  if (!dimension || Array.isArray(dimension)) {
    return null
  }
  return dimension
}

const getCategories = (dataset: Dataset, dimensionId: string): Category[] => {
  const dimension = getDimension(dataset, dimensionId)
  if (!dimension) {
    return []
  }

  const categories = dimension.Category()
  if (!categories) {
    return []
  }

  return Array.isArray(categories) ? categories : [categories]
}

const getCategory = (category: Array<Category> | Category | null): Category | null => {
  if (!category) {
    return null
  }
  return Array.isArray(category) ? (category[0] ?? null) : category
}

const getDataSourceConfig = (
  datasetFormat: DataSource['dataSource']
):
  | Extract<Highchart['dataSource'], { _selected: 'statbankApi' }>['statbankApi']
  | Extract<Highchart['dataSource'], { _selected: 'pxapi' }>['pxapi']
  | undefined => {
  if (!datasetFormat) return

  if (datasetFormat._selected === DataSourceType.STATBANK_API) {
    return datasetFormat.statbankApi
  }

  if (datasetFormat._selected === DataSourceType.PXAPI) {
    return datasetFormat.pxapi
  }

  return
}
const hasGraphType = (data: Highchart | CombinedGraph): data is Highchart => 'graphType' in data

export function seriesAndCategoriesFromJsonStat(
  req: RequestWithCode,
  highchart: Content<Highchart | CombinedGraph>,
  dataset: Dataset,
  datasetFormat: DataSource['dataSource']
): SeriesAndCategories | undefined {
  const jsonStatConfig = getDataSourceConfig(datasetFormat)
  const filterOptions = jsonStatConfig?.datasetFilterOptions
  const xAxisLabel = jsonStatConfig?.xAxisLabel ?? ''
  const yAxisLabel = jsonStatConfig?.yAxisLabel ?? ''
  const dimensionFilter = dataset && dataset.id.map(() => 0)
  const graphType = hasGraphType(highchart.data) ? highchart.data.graphType : undefined

  if (filterOptions && filterOptions._selected && filterOptions._selected === 'municipalityFilter') {
    const municipality = getMunicipality(req)
    if (!municipality) return undefined
    const filterTarget = filterOptions.municipalityFilter.municipalityDimension
    const filterTargetIndex = dataset && dataset.id.indexOf(filterTarget)
    dimensionFilter[filterTargetIndex] = parseDataWithMunicipality(dataset, filterTarget, municipality, xAxisLabel)
  }

  if (datasetFormat?._selected === DataSourceType.PXAPI) {
    return pxFormat(dataset, dimensionFilter, xAxisLabel, yAxisLabel, graphType)
  }

  if (graphType === 'barNegative') {
    return barNegativeFormat(dataset, dimensionFilter, xAxisLabel, yAxisLabel)
  } else if (graphType === 'pie') {
    return pieFormat(dataset, dimensionFilter, xAxisLabel, yAxisLabel)
  } else {
    return defaultFormat(dataset, dimensionFilter, xAxisLabel, yAxisLabel)
  }
}

const defaultFormat = (
  ds: Dataset,
  dimensionFilter: number[],
  xAxisLabel: string,
  yAxisLabel: string
): SeriesAndCategories | undefined => {
  const xAxisIndex = ds.id.indexOf(xAxisLabel)
  const xCategories = getCategories(ds, xAxisLabel)
  const yAxis = !yAxisLabel || yAxisLabel === 'Region' ? 'ContentsCode' : yAxisLabel
  const yCategories = getCategories(ds, yAxis)

  const series = xCategories.map((xCategory) => {
    dimensionFilter[xAxisIndex] = xCategory.index
    const data = getHighchartsValue(ds.Data(dimensionFilter, false))
    return {
      name: xCategory.label,
      y: data,
      data: [data],
    }
  })

  return {
    series,
    categories: yCategories.map((category) => category.label),
  }
}

function pxFormat(
  ds: Dataset,
  dimensionFilter: number[],
  xAxis: string,
  yAxis: string,
  graphType: string | undefined
): SeriesAndCategories | undefined {
  const xAxisIndex = ds.id.indexOf(xAxis)
  const yAxisIndex = ds.id.indexOf(yAxis)

  const xCategories = getCategories(ds, xAxis)
  const yCategories = getCategories(ds, yAxis)

  // PIE
  if (graphType === 'pie') {
    const data = xCategories.map((xCategory) => {
      dimensionFilter[xAxisIndex] = xCategory.index
      const value = getHighchartsValue(ds.Data(dimensionFilter, false))

      return {
        name: xCategory.label,
        y: value,
      }
    })

    return {
      series: [
        {
          name: yCategories[0]?.label ?? 'Antall',
          data,
        },
      ],
      categories: xCategories.map((category) => category.label),
    }
  }

  // OTHER GRAPH TYPES
  const series = yCategories.map((yCategory) => {
    dimensionFilter[yAxisIndex] = yCategory.index

    const data = xCategories.map((xCategory) => {
      dimensionFilter[xAxisIndex] = xCategory.index
      return getHighchartsValue(ds.Data(dimensionFilter, false))
    })

    return {
      name: yCategory.label,
      data,
    }
  })

  return {
    series,
    categories: xCategories.map((c) => c.label),
  }
}

function pieFormat(
  ds: Dataset,
  dimensionFilter: number[],
  xAxis: string,
  yAxisLabel: string
): SeriesAndCategories | undefined {
  const xAxisIndex = ds.id.indexOf(xAxis)
  const xCategories = getCategories(ds, xAxis)
  const yAxis = !yAxisLabel || yAxisLabel === 'Region' ? 'ContentsCode' : yAxisLabel
  const yCategories = getCategories(ds, yAxis)

  const series = [
    {
      name: yCategories.length === 1 ? yCategories[0].label : 'Antall',
      data: xCategories.map((xCategory) => {
        dimensionFilter[xAxisIndex] = xCategory.index
        const data = getHighchartsValue(ds.Data(dimensionFilter, false))
        return {
          name: xCategory.label,
          y: data,
          data: [data],
        }
      }),
    },
  ]

  return {
    series,
    categories: xCategories.map((category) => category.label),
  }
}

const barNegativeFormat = (
  ds: Dataset,
  dimensionFilter: number[],
  xAxis: string,
  yAxis: string
): SeriesAndCategories | undefined => {
  const xAxisIndex = ds.id.indexOf(xAxis)
  const yAxisIndex = ds.id.indexOf(yAxis)

  const xCategories = getCategories(ds, xAxis)
  const yCategories = getCategories(ds, yAxis)

  const series = yCategories.map((yCategory) => ({
    name: yCategory.label,
    data: xCategories.map((xCategory) => {
      dimensionFilter[yAxisIndex] = yCategory.index
      dimensionFilter[xAxisIndex] = xCategory.index
      const value = getHighchartsValue(ds.Data(dimensionFilter, false))
      if (typeof value === 'number') {
        return yCategory.index === 0 ? value * -1 : value
      }

      return value
    }),
  }))

  return {
    series,
    categories: xCategories.map((category) => category.label),
  }
}

const getCategoryByMunicipalityCode = (dimension: Dimension, code: string): Category | null => {
  if (!code) return null

  const category = getCategory(dimension.Category(code))

  if (category) {
    return category
  }

  // Support PxAPI format for combined municipalities e.g. K_0301 or K-0302
  let getCategoryIndexPxApi = dimension.id?.indexOf(code)

  if (getCategoryIndexPxApi === -1) {
    getCategoryIndexPxApi = dimension.id?.indexOf(`K_${code}`)
  }

  if (getCategoryIndexPxApi === -1) {
    getCategoryIndexPxApi = dimension.id?.indexOf(`K-${code}`)
  }

  return getCategory(dimension.Category(getCategoryIndexPxApi))
}

const parseDataWithMunicipality = (
  dataset: Dataset,
  filterTarget: string,
  municipality: MunicipalityWithCounty | undefined,
  xAxis: string
) => {
  let code = municipality?.code
  if (!code) return -1

  const filterDimension = getDimension(dataset, filterTarget)
  if (!filterDimension) {
    return -1
  }

  let category = getCategoryByMunicipalityCode(filterDimension, code)
  let hasData = category && hasFilterData(dataset, filterTarget, code, xAxis)

  const oldCode = municipality?.changes?.[0]?.oldCode
  if (!hasData && oldCode) {
    code = oldCode
    category = getCategoryByMunicipalityCode(filterDimension, code)
    hasData = category && hasFilterData(dataset, filterTarget, code, xAxis)
  }

  if (!hasData || !category) {
    return -1
  }

  return category.index
}

const hasFilterData = (dataset: Dataset, filterTarget: string, filter: string, xAxis: string) => {
  const filterIndex = dataset.id.indexOf(filterTarget)
  const filterDimension = getDimension(dataset, filterTarget)
  if (!filterDimension) {
    return false
  }

  const filterTargetCategory = getCategoryByMunicipalityCode(filterDimension, filter)

  if (!filterTargetCategory) {
    return false
  }
  const filterTargetCategoryIndex = filterTargetCategory.index

  const xAxisIndex = dataset.id.indexOf(xAxis)
  const xCategories = getCategories(dataset, xAxis)

  return xCategories.reduce((hasData, xCategory) => {
    if (hasData) {
      return hasData
    }

    const firstDimension = dataset.id.map(() => 0)

    firstDimension[filterIndex] = filterTargetCategoryIndex
    firstDimension[xAxisIndex] = xCategory.index

    return !!dataset.Data(firstDimension, false)
  }, false)
}
