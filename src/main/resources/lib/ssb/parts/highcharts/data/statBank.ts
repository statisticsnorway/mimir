// @ts-nocheck

import { getMunicipality } from '/lib/ssb/dataset/klass/municipalities'
import { DataSource as DataSourceType } from '/lib/ssb/repo/dataset'

export function seriesAndCategoriesFromJsonStat(req, highchart, dataset, datasetFormat) {
  const jsonStatConfig =
    datasetFormat.jsonStat || datasetFormat[DataSourceType.STATBANK_API] || datasetFormat[DataSourceType.PXAPI]
  const filterOptions = jsonStatConfig.datasetFilterOptions
  const xAxisLabel = jsonStatConfig.xAxisLabel
  const yAxisLabel = jsonStatConfig.yAxisLabel
  const dimensionFilter = dataset && dataset.id.map(() => 0)

  if (filterOptions && filterOptions._selected && filterOptions._selected === 'municipalityFilter') {
    const municipality = getMunicipality(req)
    if (!municipality) return undefined
    const filterTarget = filterOptions.municipalityFilter.municipalityDimension
    const filterTargetIndex = dataset && dataset.id.indexOf(filterTarget)
    dimensionFilter[filterTargetIndex] = parseDataWithMunicipality(dataset, filterTarget, municipality, xAxisLabel)
  }

  if (datasetFormat?._selected === DataSourceType.PXAPI) {
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

const defaultFormat = (ds, dimensionFilter, xAxis, yAxisLabel) => {
  const xAxisIndex = ds.id.indexOf(xAxis)
  const xCategories = ds.Dimension(xAxis).Category()
  const yAxis = !yAxisLabel || yAxisLabel === 'Region' ? 'ContentsCode' : yAxisLabel
  const yCategories = ds.Dimension(yAxis).Category()

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

function pxFormat(ds, dimensionFilter, xAxis, yAxis, graphType) {
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

function pieFormat(ds, dimensionFilter, xAxis, yAxisLabel) {
  const xAxisIndex = ds.id.indexOf(xAxis)
  const xCategories = ds.Dimension(xAxis).Category()
  const yAxis = !yAxisLabel || yAxisLabel === 'Region' ? 'ContentsCode' : yAxisLabel
  const yCategories = ds.Dimension(yAxis).Category()

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

const barNegativeFormat = (ds, dimensionFilter, xAxis, yAxis) => {
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

const getCategoryByMunicipalityCode = (dimension, code) => {
  if (!code) return null

  const category = dimension.Category(code)

  if (category) {
    return category
  }

  // Support PxAPI format for combined municipalities e.g. K_0301 or K-0302
  let getCategoryIndexPxApi = dimension.id.indexOf(code)

  if (getCategoryIndexPxApi === -1) {
    getCategoryIndexPxApi = dimension.id.indexOf(`K_${code}`)
  }

  if (getCategoryIndexPxApi === -1) {
    getCategoryIndexPxApi = dimension.id.indexOf(`K-${code}`)
  }

  return dimension.Category(getCategoryIndexPxApi)
}

const parseDataWithMunicipality = (dataset, filterTarget, municipality, xAxis) => {
  let code = municipality?.code
  if (!code) return -1

  let category = getCategoryByMunicipalityCode(dataset.Dimension(filterTarget), code)
  let hasData = category && hasFilterData(dataset, filterTarget, code, xAxis)

  const getDataFromOldMunicipalityCode = municipality?.changes?.length
  if (!hasData && getDataFromOldMunicipalityCode) {
    code = municipality.changes[0].oldCode
    category = getCategoryByMunicipalityCode(dataset.Dimension(filterTarget), code)
    hasData = category && hasFilterData(dataset, filterTarget, code, xAxis)
  }

  if (!hasData || !category) {
    return -1
  }

  return category.index
}

const hasFilterData = (dataset, filterTarget, filter, xAxis) => {
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
