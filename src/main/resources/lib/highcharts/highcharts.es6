const util = __non_webpack_require__('/lib/util')
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

const getRowValue = (value) => {
  if (typeof value === 'object' && value.content != undefined) {
    return value.content
  }
  return value
}

export const defaultTbmlFormat = (data, graphType, xAxisType) => {
  const rows = data.tbml.presentation.table.tbody.tr
  let headers = data.tbml.presentation.table.thead.tr.th
  let categories = []
  if (!Array.isArray(headers)) {
    headers = [headers]
  }
  let series = []
  if (graphType === 'pie') {
    categories = headers
    series = rows.map((row) => {
      return {
        name: row.th,
        y: getRowValue(row.td)
      }
    })
  } else if ((graphType === 'area' || graphType === 'line') && xAxisType === 'linear') {
    categories = headers
    series = categories.map((cat, index) => {
      return {
        name: cat,
        data: rows.map((row) => {
          return [
            row.th,
            getRowValue(util.data.forceArray(row.td)[index])
          ]
        })
      }
    })
  } else {
    series = headers.map((name) => ({
      name,
      data: []
    }))
    rows.forEach((row) => {
      categories.push(row.th)
      series.forEach((serie, index) => {
        serie.data.push(getRowValue(util.data.forceArray(row.td)[index]))
      })
    })
  }
  return {
    categories,
    series
  }
}
