const {
  seriesAndCategoriesFromHtmlTable
} = __non_webpack_require__( '/lib/highcharts/data/htmlTable')
const {
  seriesAndCategoriesFromJsonStat
} = __non_webpack_require__( '/lib/highcharts/data/statBank')
const {
  seriesAndCategoriesFromTbml
} = __non_webpack_require__( '/lib/highcharts/data/tbProcessor')
const {
  DataSource: DataSourceType
} = __non_webpack_require__( '/lib/repo/dataset')


/**
 * @param {Object} req
 * @param {Object} highchartsContent
 * @param {Object} data
 * @param {Object} dataFormat
 * @return {{series: {data: *, name: (*|string)}[], categories: *}|*}
 */
export function prepareHighchartsData(req, highchartsContent, data, dataFormat) {
  const seriesAndCategories = getSeriesAndCategories(req, highchartsContent, data, dataFormat)
  const seriesAndCategoriesOrData = seriesAndCategories && !seriesAndCategories.series ?
    addDataProperties(highchartsContent, seriesAndCategories) : seriesAndCategories
  return switchRowsAndColumnsCheck(highchartsContent, seriesAndCategoriesOrData, dataFormat)
}

/**
 * @param {Object} req
 * @param {Object} highchartsContent
 * @param {Object} data
 * @param {Object} dataFormat
 * @return {{categories: *, series: *}}
 */
export function getSeriesAndCategories(req, highchartsContent, data, dataFormat) {
  if (dataFormat._selected === 'jsonStat' || dataFormat._selected === DataSourceType.STATBANK_API) {
    return seriesAndCategoriesFromJsonStat(req, highchartsContent, data, dataFormat)
  } else if (dataFormat._selected === 'tbml' || dataFormat._selected === DataSourceType.TBPROCESSOR) {
    return seriesAndCategoriesFromTbml(data, highchartsContent.data.graphType, highchartsContent.data.xAxisType)
  } else if (dataFormat._selected === DataSourceType.HTMLTABLE) {
    return seriesAndCategoriesFromHtmlTable(highchartsContent)
  }
}

/**
 * @param {Object} highchartContent
 * @param {Object} seriesAndCategories
 * @param {Object} dataFormat
 * @return {{series: {data: *, name: (*|string)}[], categories: *}}
 */
export function switchRowsAndColumnsCheck(highchartContent, seriesAndCategories, dataFormat) {
  return (!dataFormat._selected === DataSourceType.STATBANK_API && highchartContent.data.graphType === 'pie' ||
    highchartContent.data.switchRowsAndColumns) ?
    switchRowsAndColumns(seriesAndCategories, dataFormat) : seriesAndCategories
}

function switchRowsAndColumns(seriesAndCategories, dataFormat) {
  const isJsonStat = dataFormat._selected === 'jsonStat' || dataFormat._selected === DataSourceType.STATBANK_API
  const c = {
    categories: seriesAndCategories.categories[0] && !isJsonStat ? seriesAndCategories.series.map((serie) => serie.name) : 'Antall',
    series: seriesAndCategories.categories.map((category, categoryIndex) => ({
      name: category,
      data: seriesAndCategories.series.map((serie) => {
        return serie.data[categoryIndex]
      })
    }))
  }
  return c
}
/*
function switchRowsAndColumns(seriesAndCategories, dataFormat) {
  const isJsonStat = dataFormat._selected === 'jsonStat' || dataFormat._selected === DataSourceType.STATBANK_API
  const c = {
    categories: seriesAndCategories.categories,
    series: [{
      name: seriesAndCategories.categories[0] && !isJsonStat ? seriesAndCategories.categories[0] : 'Antall',
      data: seriesAndCategories.series.reduce((data, serie) => {
        if (serie.y != null) {
          data.push({
            y: serie.y,
            name: serie.name
          })
        }
        return data
      }, [])
    }]
  }
  return c
}*/

/**
 * @param {Object} highchartContent
 * @param {Object} seriesAndCategories
 * @return {{data: {switchRowsAndColumns: *, decimalPoint: string, table: string}}}
 */
export function addDataProperties(highchartContent, seriesAndCategories) {
  const withDataProperty = {
    ...seriesAndCategories,
    data: {
      switchRowsAndColumns: highchartContent.data.switchRowsAndColumns,
      decimalPoint: ',',
      table: 'highcharts-datatable-' + highchartContent._id
    }
  }
  return withDataProperty
}

export const getRowValue = (value) => {
  if (typeof value === 'object' && value.content != undefined) {
    return value.content
  }
  return value
}
