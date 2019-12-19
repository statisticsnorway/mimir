import { query } from '/lib/xp/content'
import { NOT_FOUND } from './error'
import { getWithSelection } from '/lib/klass/klass'


const contentTypeName = `${app.name}:dataset`

export const get = (key) => {
  const content = query({
    contentTypes: [contentTypeName],
    query: `_id = '${key.key}'`
  });
  return content.count === 1 ? {...content.hits[0], status: 200} : NOT_FOUND
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
 * Parse the multidementional json-stat structure to a simple object with label and value.
 * @param {Object} data
 * @return {{label: String, value: String}[]}
 */
export const parseJsonStatToLabelValue = (data) => {
  const dataKey = data.dimension.id[0]
  const valueIndex = data.dimension[dataKey].category.index
  const labels = data.dimension[dataKey].category.label

  return Object.keys(labels).map( (key) => ({
    label: labels[key],
    value: data.value[valueIndex[key]]
  }))
}

/**
 * Get value from dataset with index
 * @param {Object} data: JSON-STAT object
 * @param {String} index
 * @return {{label: {String}, value: {String}}}
 */
export const getValueWithIndex = (data, index) => {
  const dataKey = data.dimension.id[0]
  const valueIndex = data.dimension[dataKey].category.index
  return data.value[valueIndex[index]]
}


export const getDataSetFromDataQuery = (dataqueryContent) => {
  return getWithSelection(dataqueryContent.data.table, JSON.parse(dataqueryContent.data.json))
}
