import {logDataQueryEvent} from '../repo/query';

const {
  get: getDataQuery,
  query
} = __non_webpack_require__( '/lib/xp/content')
const {
  NOT_FOUND
} = __non_webpack_require__( './error')
const util = __non_webpack_require__( '/lib/util')
const { Events } = __non_webpack_require__('/lib/repo/query')

const contentTypeName = `${app.name}:dataquery`

export const get = (key) => {
  const queryString = `_id = '${key.key}'`
  const content = query({
    contentTypes: [contentTypeName],
    query: queryString
  })
  return content.count === 1 ? {
    ...content.hits[0],
    status: 200
  } : NOT_FOUND
}

export const getAllOrOneDataQuery = (selector) => {
  if (selector === '*') {
    return query({
      count: 999,
      contentTypes: [`${app.name}:dataquery`],
      query: `data.table LIKE 'http*'`
    }).hits
  } else {
    const result = getDataQuery({
      key: selector
    })
    if(result) {
      logDataQueryEvent(selector, {message: Events.FOUND_DATAQUERY})
      return util.data.forceArray(result)
    } else {
      logDataQueryEvent(selector, {message: Events.FAILED_TO_FIND_DATAQUERY})
      return [{
        _id: selector,
        message: Events.FAILED_TO_FIND_DATAQUERY
      }]
    }
  }
}
