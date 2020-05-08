const {
  query
} = __non_webpack_require__( '/lib/xp/content')
const {
  NOT_FOUND
} = __non_webpack_require__( './error')

const moment = require('moment/min/moment-with-locales')
import JsonStat from 'jsonstat-toolkit'

const contentTypeName = `${app.name}:dataset`

export const get = (key) => {
  const content = query({
    contentTypes: [contentTypeName],
    query: `_id = '${key.key}'`
  })
  return content.count === 1 ? {
    ...content.hits[0],
    status: 200
  } : NOT_FOUND
}

export const getAllOrOneDataSet = (selector) => {
  if (selector === '*') {
    return content.query({
      start: 0,
      count: 999,
      contentTypes: [`${app.name}:dataset`]
    }).hits

  } else {
    return getDataSetWithDataQueryId(selector).hits
  }
}

/**
 * Get the last created dataset with its parent dataQuery content id
 * @param {string} dataQueryContentId
 * @return {object}
 */
export const getDataSetWithDataQueryId = (dataQueryContentId) => {
  return query({
    count: 1,
    contentTypes: [contentTypeName],
    sort: 'createdTime DESC',
    query: `data.dataquery = '${dataQueryContentId}'`
  })
}

/**
 * Returns the datasets time definition
 * @param {object} dataset
 * @return {String}
 */
export const getTime = (dataset) => {
  const timeKey = dataset.dimension.role.time[0]
  return Object.keys(dataset.dimension[timeKey].category.label)[0]
}

/**
 * Get value from dataset with index
 * @param {Object} data: JSON-STAT object
 * @param {string} index
 * @return {{label: {String}, value: {String}}}
 */
export const getValueWithIndex = (data, filterTarget, filter) => {
  const ds = JsonStat(data).Dimension(0)
  const dataKey = data.dimension.id[0]
  const valueIndexes = data.dimension[dataKey].category.index
  return data.value[valueIndexes[index]]
}

/**
 *
 * @param {} datasetId
 * @param {} municipality
 * @return {*}
 */
export const getDataFromCurrentOrOldMunicipalityCode = (dataset, municipality) => {
  if (dataset && dataset.data && dataset.data.json) {
    try {
      const json = JSON.parse(dataset.data.json)
      const ds = JsonStat(json).Dataset(0)

      const region = ds.Dimension(0).Category(municipality.code)
      const categories = ds.Dimension(1).Category()

      return categories.map( (category, i) => {
        const data = ds.Data([region.index, i, 0, 0], false) // [0,i,0,0]
        return {
          name: category.label,
          data: [data],
          y: [data]
        }
      })
    } catch (e) {
      log.error('Could not parse json from dataset')
      log.error(e)
    }
  }
  return []
}

export const getUpdated = (ds) => moment(ds.modifiedTime).format('DD.MM.YYYY HH:mm:ss')
export const getUpdatedReadable = (ds) => moment(ds.modifiedTime).fromNow()


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
