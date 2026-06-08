import { Content } from '@enonic-types/lib-portal'
import { type Request } from '@enonic-types/core'
import { getMunicipality } from '/lib/ssb/dataset/klass/municipalities'
import { DataSource as DataSourceType } from '/lib/ssb/repo/dataset'
import { type Dimension, type JSONstat } from '/lib/types/jsonstat-toolkit'
import { MunicipalityWithCounty } from '/lib/types/municipalities'
import { type CombinedGraph, type Highchart } from '/site/content-types'
import { DataSource } from '/site/mixins/dataSource'

export function seriesAndCategoriesFromJsonStat(
  req: Request,
  highchart: Content<Highchart | CombinedGraph>,
  dataset: JSONstat,
  datasetFormat: DataSource['dataSource']
) {
  const jsonStatConfig =
    datasetFormat.jsonStat || datasetFormat[DataSourceType.STATBANK_API] || datasetFormat[DataSourceType.PXAPI]
  const filterOptions = jsonStatConfig.datasetFilterOptions
  const xAxisLabel = jsonStatConfig.xAxisLabel as string
  const yAxisLabel = jsonStatConfig.yAxisLabel as string
  const dimensionFilter = dataset && dataset.id.map(() => 0)

  if (filterOptions && filterOptions._selected && filterOptions._selected === 'municipalityFilter') {
    const municipality = getMunicipality(req)
    if (!municipality) return undefined
    const filterTarget = filterOptions.municipalityFilter.municipalityDimension as string
    const filterTargetIndex = dataset && dataset.id.indexOf(filterTarget)
    dimensionFilter[filterTargetIndex] = parseDataWithMunicipality(dataset, filterTarget, municipality, xAxisLabel)
  }

  if (datasetFormat?._selected === DataSourceType.PXAPI) {
    log.info(JSON.stringify(dimensionFilter))
    return pxFormat(dataset, dimensionFilter, xAxisLabel, yAxisLabel, highchart.data.graphType)
  }

  if (highchart.data.graphType === 'barNegative') {
    return barNegativeFormat(dataset, dimensionFilter, xAxisLabel, yAxisLabel)
  } else if (highchart.data.graphType === 'pie') {
    return pieFormat(dataset, dimensionFilter, xAxisLabel, yAxisLabel)
  } else {
    return defaultFormat(dataset, dimensionFilter, xAxisLabel, yAxisLabel)
  }
}

const defaultFormat = (ds: JSONstat, dimensionFilter: number[], xAxisLabel: string, yAxisLabel: string) => {
  const xAxisIndex = ds.id.indexOf(xAxisLabel)
  const xCategories = ds.Dimension(xAxisLabel)?.Category()
  const yAxis = !yAxisLabel || yAxisLabel === 'Region' ? 'ContentsCode' : yAxisLabel
  const yCategories = ds.Dimension(yAxis)?.Category()

  const series = xCategories.map((xCategory) => {
    dimensionFilter[xAxisIndex] = xCategory.index
    const data = ds.Data(dimensionFilter, false)
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

function pxFormat(ds: JSONstat, dimensionFilter: number[], xAxis: string, yAxis: string, graphType: string) {
  const xAxisIndex = ds.id.indexOf(xAxis)
  const yAxisIndex = ds.id.indexOf(yAxis)

  const xCategories = ds.Dimension(xAxis).Category()
  const yCategories = ds.Dimension(yAxis).Category()

  // PIE
  if (graphType === 'pie') {
    const data = xCategories.map((xCategory) => {
      dimensionFilter[xAxisIndex] = xCategory.index
      const value = ds.Data(dimensionFilter, false)

      return {
        name: xCategory.label,
        y: value,
      }
    })

    return {
      series: [
        {
          data,
        },
      ],
    }
  }

  // OTHER GRAPH TYPES
  const series = yCategories.map((yCategory) => {
    dimensionFilter[yAxisIndex] = yCategory.index

    const data = xCategories.map((xCategory) => {
      dimensionFilter[xAxisIndex] = xCategory.index
      return ds.Data(dimensionFilter, false)
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

function pieFormat(ds: JSONstat, dimensionFilter: number[], xAxis: string, yAxisLabel: string) {
  const xAxisIndex = ds.id.indexOf(xAxis)
  const xCategories = ds.Dimension(xAxis)?.Category()
  const yAxis = !yAxisLabel || yAxisLabel === 'Region' ? 'ContentsCode' : yAxisLabel
  const yCategories = ds.Dimension(yAxis)?.Category()

  const series = [
    {
      name: yCategories.length === 1 ? yCategories[0].label : 'Antall',
      data: xCategories.map((xCategory) => {
        dimensionFilter[xAxisIndex] = xCategory.index
        const data = ds.Data(dimensionFilter, false)
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

const barNegativeFormat = (ds: JSONstat, dimensionFilter: number[], xAxis: string, yAxis: string) => {
  const xAxisIndex = ds.id.indexOf(xAxis)
  const yAxisIndex = ds.id.indexOf(yAxis)

  const xCategories = ds.Dimension(xAxis).Category()
  const yCategories = ds.Dimension(yAxis).Category()

  const series = yCategories.map((yCategory) => ({
    name: yCategory.label,
    data: xCategories.map((xCategory) => {
      dimensionFilter[yAxisIndex] = yCategory.index
      dimensionFilter[xAxisIndex] = xCategory.index
      const value = ds.Data(dimensionFilter, false)
      return yCategory.index === 0 ? value * -1 : value
    }),
  }))

  return {
    series,
    categories: xCategories.map((category) => category.label),
  }
}

const getCategoryByMunicipalityCode = (dimension: Dimension, code: string) => {
  if (!code) return null

  const category = dimension.Category(code)

  if (category) {
    return category
  }

  const getCategoryIndexPxApi = dimension?.id?.indexOf(code)

  const getCategoryPxApi = dimension.Category(getCategoryIndexPxApi)

  return getCategoryPxApi
  return
}

const parseDataWithMunicipality = (
  dataset: JSONstat,
  filterTarget: string,
  municipality: MunicipalityWithCounty | undefined,
  xAxis: string
) => {
  let code = municipality?.code
  if (!code) return -1

  let category = getCategoryByMunicipalityCode(dataset.Dimension(filterTarget), code)
  let hasData = category && hasFilterData(dataset, filterTarget, code, xAxis)
  log.info(`Checking for data with municipality code ${code}: category: ${category}, ${hasData}`)

  const getDataFromOldMunicipalityCode = municipality?.changes && municipality.changes.length > 0
  if (!hasData && getDataFromOldMunicipalityCode) {
    log.info('in getDataFromOldMunicipalityCode')
    code = municipality!.changes![0].oldCode
    category = getCategoryByMunicipalityCode(dataset.Dimension(filterTarget), code)
    hasData = category && hasFilterData(dataset, filterTarget, code, xAxis)
  }

  if (!hasData || !category) {
    return -1
  }

  return category.index
}

const hasFilterData = (dataset: JSONstat, filterTarget: string, filter: string, xAxis: string) => {
  const filterIndex = dataset.id.indexOf(filterTarget)
  const filterTargetCategory = getCategoryByMunicipalityCode(dataset.Dimension(filterTarget), filter)

  if (!filterTargetCategory) {
    return false
  }
  const filterTargetCategoryIndex = filterTargetCategory.index

  const xAxisIndex = dataset.id.indexOf(xAxis)
  const xCategories = dataset.Dimension(xAxis).Category()

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
