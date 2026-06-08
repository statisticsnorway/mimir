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
    log.info(`dimensionFilter before pxFormat: ${JSON.stringify(dimensionFilter, null, 2)}`)
    return seriesAndCategoriesFromPxApi(highchart, dataset, datasetFormat)
  }

  log.info(`dimensionFilter before defaultFormat (statbankApi): ${JSON.stringify(dimensionFilter, null, 2)}`)
  if (highchart.data.graphType === 'barNegative') {
    return barNegativeFormat(dataset, dimensionFilter, xAxisLabel, yAxisLabel)
  } else if (highchart.data.graphType === 'pie') {
    return pieFormat(dataset, dimensionFilter, xAxisLabel, yAxisLabel)
  } else {
    return defaultFormat(dataset, dimensionFilter, xAxisLabel, yAxisLabel)
  }
}

function seriesAndCategoriesFromPxApi(highchart, dataset, datasetFormat) {
  log.info('in seriesAndCategoriesFromPxApi function')
  const config = datasetFormat[DataSourceType.PXAPI] || {}
  const dimensions = dataset.id

  const xAxis = config.xAxisLabel && dimensions.includes(config.xAxisLabel) ? config.xAxisLabel : dimensions[0]

  const yAxis =
    config.yAxisLabel && dimensions.includes(config.yAxisLabel) ? config.yAxisLabel : dimensions[1] || dimensions[0]

  const dimensionFilter = dimensions.map(() => 0)

  return pxFormat(dataset, dimensionFilter, xAxis, yAxis, highchart.data.graphType)
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

const getCategoryByMunicipalityCode = (dataset, filterTarget, code) => {
  const dimension = dataset.Dimension(filterTarget)
  if (!code) return null

  const category = dimension.Category(code)

  if (category) {
    log.info(`Found category for municipality code ${code}: ${category.label}`)
    return category
  }

  // Support PxAPI format for combined municipalities e.g. K_0301 or K-0302
  let getCategoryIndexPxApi = dimension.id.indexOf(`K_${code}`)
  if (getCategoryIndexPxApi === -1) {
    getCategoryIndexPxApi = dimension.id.indexOf(`K-${code}`)
  }

  const getCategoryPxApi = dimension.Category(getCategoryIndexPxApi)
  log.info(`category (k-kommune) code: K_${code}`)
  log.info('category (k-kommune) index: ' + JSON.stringify(getCategoryIndexPxApi, null, 2))
  log.info('category (k-kommune) category: ' + JSON.stringify(getCategoryPxApi, null, 2))

  return getCategoryPxApi
}

const parseDataWithMunicipality = (dataset, filterTarget, municipality, xAxis) => {
  let code = municipality?.code
  if (!code) return -1

  let category = getCategoryByMunicipalityCode(dataset, filterTarget, code)
  let hasData = category && hasFilterData(dataset, filterTarget, code, xAxis)
  log.info(
    `Checking for data with municipality code ${code}: category: ${JSON.stringify(category, null, 2)}, ${hasData}`
  )

  const getDataFromOldMunicipalityCode = municipality.changes.length > 0
  if (!hasData && getDataFromOldMunicipalityCode) {
    log.info('in getDataFromOldMunicipalityCode')
    code = municipality.changes[0].oldCode
    category = getCategoryByMunicipalityCode(dataset, filterTarget, code)
    hasData = category && hasFilterData(dataset, filterTarget, code, xAxis)
  }

  if (!hasData || !category) {
    return -1
  }

  log.info(`category index for municipality code ${code}: ${category.index}`)
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
