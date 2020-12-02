const util = __non_webpack_require__('/lib/util')

const getRowValue = (value) => {
  if (typeof value === 'object' && value.content != undefined) {
    return value.content
  }
  return value
}

export const seriesAndCategoriesFromTbml = (data, graphType, xAxisType) => {
  const tbody = util.data.forceArray(data.tbml.presentation.table.tbody)
  const thead = util.data.forceArray(data.tbml.presentation.table.thead)
  const rows = util.data.forceArray(tbody[0].tr)
  const headers = util.data.forceArray(thead[0].tr.th)
  let categories = []
  let series = []
  if (graphType === 'pie') {
    categories = headers
    series = [{
      name: headers[0],
      data: rows.map((row) => {
        return {
          name: row.th,
          y: getRowValue(row.td)
        }
      })
    }]
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
    series,
    title: parseTitle(data.tbml.metadata)
  }
}

function parseTitle(metadata) {
  if (metadata.title && typeof(metadata.title) === 'string') {
    return metadata.title
  } else if (metadata.title && metadata.title.content) {
    return metadata.title.content
  }
}
