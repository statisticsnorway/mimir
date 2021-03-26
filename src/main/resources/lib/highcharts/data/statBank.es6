/* eslint-disable new-cap */
const {
  getMunicipality
} = __non_webpack_require__( '/lib/klass/municipalities')
const {
  parseDataWithMunicipality
} = __non_webpack_require__('/lib/ssb/dataset')

const {
  DataSource: DataSourceType
} = __non_webpack_require__( '/lib/repo/dataset')


export function seriesAndCategoriesFromJsonStat(req, highchart, dataset, datasetFormat) {
  const jsonStatConfig = datasetFormat.jsonStat || datasetFormat[DataSourceType.STATBANK_API]
  const filterOptions = jsonStatConfig.datasetFilterOptions
  const xAxisLabel = jsonStatConfig.xAxisLabel
  const yAxisLabel = jsonStatConfig.yAxisLabel
  const dimensionFilter = dataset && dataset.id.map( () => 0 )

  if (filterOptions && filterOptions._selected && filterOptions._selected === 'municipalityFilter') {
    const municipality = getMunicipality(req)
    const filterTarget = filterOptions.municipalityFilter.municipalityDimension
    const filterTargetIndex = dataset && dataset.id.indexOf(filterTarget)
    dimensionFilter[filterTargetIndex] = parseDataWithMunicipality(dataset, filterTarget, municipality, xAxisLabel)
  }

  if (highchart.data.graphType === 'barNegative') {
    return barNegativeFormat(dataset, dimensionFilter, xAxisLabel, yAxisLabel)
  } else if (highchart.data.graphType === 'pie') {
    return pieFormat(dataset, dimensionFilter, xAxisLabel)
  } else {
    return defaultFormat(dataset, dimensionFilter, xAxisLabel, yAxisLabel)
  }
}

const defaultFormat = (ds, dimensionFilter, xAxis, yAxisLabel) => {
  const xAxisIndex = ds.id.indexOf(xAxis)
  const xCategories = ds.Dimension(xAxis).Category()
  const yAxis = !yAxisLabel || yAxisLabel === 'Region' ? 'ContentsCode' : yAxisLabel
  const yAxisIndex = ds.id.indexOf(yAxis)
  const yCategories = ds.Dimension(yAxis).Category()

  const series = yCategories.map( (yCategory) => {
    dimensionFilter[yAxisIndex] = yCategory.index
    return {
      name: yCategory.label,
      data: xCategories.map( (xCategory) => {
        dimensionFilter[yAxisIndex] = yCategory.index
        dimensionFilter[xAxisIndex] = xCategory.index
        return ds.Data(dimensionFilter, false)
      })
    }
  })

  return {
    series,
    categories: xCategories.map((category) => category.label)
  }
}

function pieFormat(ds, dimensionFilter, xAxis) {
  const xAxisIndex = ds.id.indexOf(xAxis)
  const xCategories = ds.Dimension(xAxis).Category()

  const series = [{
    name: 'Antall',
    data: xCategories.map((xCategory) => {
      dimensionFilter[xAxisIndex] = xCategory.index
      const data = ds.Data(dimensionFilter, false)
      return {
        name: xCategory.label,
        y: data,
        data: [data]
      }
    })
  }]

  return {
    series,
    categories: xCategories.map((category) => category.label)
  }
}

const barNegativeFormat = (ds, dimensionFilter, xAxis, yAxis) => {
  const xAxisIndex = ds.id.indexOf(xAxis)
  const yAxisIndex = ds.id.indexOf(yAxis)

  const xCategories = ds.Dimension(xAxis).Category()
  const yCategories = ds.Dimension(yAxis).Category()

  const series = yCategories.map( (yCategory) => ({
    name: yCategory.label,
    data: xCategories.map( (xCategory) => {
      dimensionFilter[yAxisIndex] = yCategory.index
      dimensionFilter[xAxisIndex] = xCategory.index
      const value = ds.Data(dimensionFilter, false)
      return yCategory.index === 0 ? value * -1 : value
    })
  }))

  return {
    series,
    categories: xCategories.map((category) => category.label)
  }
}
