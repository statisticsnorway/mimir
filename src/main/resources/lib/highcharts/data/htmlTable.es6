const util = __non_webpack_require__('/lib/util')

const xmlParser = __.newBean('no.ssb.xp.xmlparser.XmlParser')

export function seriesAndCategoriesFromHtmlTable(highchartsContent) {
  const stringJson = __.toNativeObject(xmlParser.parse(highchartsContent.data.htmlTable))
  const result = JSON.parse(stringJson)
  const categories = result.table.tbody.tr.reduce((previous, tr, index) => {
    if (index > 0) previous.push(tr.td[0].content)
    return previous
  }, [])

  const tableData = result.table.tbody

  const dataInSeries = tableData.tr[0].td.reduce( (acc, current, tdIndex) => {
    acc.push({
      name: current.content,
      data: tableData.tr.reduce( (dataAcc, tr, trIndex) => {
        if (trIndex > 0) dataAcc.push(parseValue(tr.td[tdIndex].content))
        return dataAcc
      }, [])
    })
    return acc
  }, [])

  dataInSeries.splice(0, 1) // remove the first because its garbage

  return convertToCorrectGraphFormat({
    categories,
    series: dataInSeries
  }, highchartsContent.data.graphType, highchartsContent.data.xAxisType)
}

function parseValue(value) {
  const number = typeof(value) === 'string' ?
    value.replace(',', '.')
      .replace(/&nbsp;/g, '')
      .replace(' ', '') :
    value

  return parseFloat(number)
}

/**
 * @param {Object} seriesAndCategories
 * @param {Object} graphType
 * @param {Object} xAxisType
 * @return {{series: *, categories: *}|*}
 */
function convertToCorrectGraphFormat(seriesAndCategories, graphType, xAxisType) {
  if (graphType === 'pie') {
    return dataFormatPie(seriesAndCategories)
  } else if ((graphType === 'area' || graphType === 'line') && xAxisType === 'linear') {
    return {
      categories: seriesAndCategories.categories,
      series: dataFormatAreaLineLinear(seriesAndCategories)
    }
  } else if (graphType === 'column' || graphType === 'bar' ||
             graphType === 'barNegative' || graphType === 'area' || graphType === 'line') {
    return seriesAndCategories
  } else {
    return {
      categories: seriesAndCategories.categories,
      series: dataFormatDefault(seriesAndCategories)
    }
  }
}

export function dataFormatDefault(seriesAndCategories) {
  const data = seriesAndCategories.series.map( (point) => {
    return point.data[0]
  })
  const series = [{
    name: 'something',
    data
  }]
  return series
}

function dataFormatAreaLineLinear(seriesAndCategories) {
  return seriesAndCategories.categories.map((cat, index) => {
    return {
      name: cat,
      data: seriesAndCategories.series.map((row) => {
        return [
          row.name,
          getRowValue(util.data.forceArray(row.data)[index])
        ]
      })
    }
  })
}

function dataFormatPie(seriesAndCategories) {
  if (seriesAndCategories.categories.length === 1) {
    return {
      series: [{
        name: 'Antall',
        data: seriesAndCategories.series.map((serie) => ({
          ...serie,
          y: serie.data[0]
        }))
      }]
    }
  } else {
    return {
      series: [{
        name: 'Antall',
        data: seriesAndCategories.categories.map((category, index) => {
          return {
            name: category,
            y: seriesAndCategories.series[0].data[index],
            data: seriesAndCategories.series[0].data[index]
          }
        })
      }]
    }
  }
}


export const getRowValue = (value) => {
  if (typeof value === 'object' && value.content != undefined) {
    return value.content
  }
  return value
}
