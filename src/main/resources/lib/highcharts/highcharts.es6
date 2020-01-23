/* eslint-disable new-cap */

export const defaultFormat = (ds, dimensionFilter, xAxis) => {
  const xAxisIndex = ds.id.indexOf(xAxis)
  const xCategories = ds.Dimension(xAxis).Category()

  const series = xCategories.map( (xCategory) => {
    dimensionFilter[xAxisIndex] = xCategory.index
    const data = ds.Data(dimensionFilter, false)
    return {
      name: xCategory.label,
      y: data,
      data: [data]
    }
  })

  return {
    series,
    categories: xCategories.map((category) => category.label)
  }
}

export const barNegativeFormat = (ds, dimensionFilter, xAxis, yAxis) => {
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

export const defaultTbmlFormat = (data) => {
  const rows = data.tbml.presentation.table.tbody.tr
  let headers = data.tbml.presentation.table.thead.tr.th
  const categories = []
  if (!Array.isArray(headers)) {
    headers = [headers]
  }
  const series = headers.map((name) => ({
    name,
    data: []
  }))
  rows.forEach((row) => {
    categories.push(row.th)
    series.forEach((serie, index) => {
      if (!Array.isArray(row.td)) {
        serie.data.push(row.td)
      } else {
        serie.data.push(row.td[index])
      }
    })
  })
  return {
    categories,
    series
  }
}

export const parseDataWithMunicipality = (dataset, filterTarget, municipality, xAxis) => {
  let code = municipality.code
  let hasData = hasFilterData(dataset, filterTarget, code, xAxis )

  if ( !hasData ) {
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
  const filterTargetCategoryIndex = dataset.Dimension(filterTarget).Category(filter).index
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
