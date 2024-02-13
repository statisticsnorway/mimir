/* eslint-disable new-cap */
// @ts-nocheck

import { getMunicipality } from '/lib/ssb/dataset/klass/municipalities'

import { DataSource as DataSourceType } from '/lib/ssb/repo/dataset'

export function seriesAndCategoriesFromJsonStat(req, highchart, dataset, datasetFormat) {
  const jsonStatConfig = datasetFormat.jsonStat || datasetFormat[DataSourceType.STATBANK_API]
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

const parseDataWithMunicipality = (dataset, filterTarget, municipality, xAxis) => {
  let code = municipality?.code
  if (!code) return -1

  let hasData = hasFilterData(dataset, filterTarget, code, xAxis)

  if (!hasData) {
    const getDataFromOldMunicipalityCode = municipality.changes.length > 0
    if (getDataFromOldMunicipalityCode) {
      code = municipality.changes[0].oldCode
      hasData = hasFilterData(dataset, filterTarget, code, xAxis)
    }
  }
  if (hasData) {
    return dataset.Dimension(filterTarget).Category(code).index
  }
  return -1
}

const hasFilterData = (dataset, filterTarget, filter, xAxis) => {
  const filterIndex = dataset.id.indexOf(filterTarget)
  const filterTargetCategory = dataset.Dimension(filterTarget).Category(filter)
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
    const dimension = dataset.id.map(() => 0) // creates [5061,0,0,0]
    dimension[filterIndex] = filterTargetCategoryIndex
    dimension[xAxisIndex] = xCategory.index
    return !!dataset.Data(dimension, false)
  }, false)
}
