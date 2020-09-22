const {
  logUserDataQuery
} = __non_webpack_require__( '../repo/query')
const {
  get: getContent,
  query
} = __non_webpack_require__( '/lib/xp/content')
const {
  NOT_FOUND
} = __non_webpack_require__( './error')
const util = __non_webpack_require__( '/lib/util')
const {
  Events
} = __non_webpack_require__('/lib/repo/query')

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

export const getAllOrOneDataQuery = (id) => {
  const result = getContent({
    key: id
  })
  if (result) {
    logUserDataQuery(id, {
      message: Events.FOUND_DATAQUERY
    })
    return util.data.forceArray(result)
  } else {
    logUserDataQuery(id, {
      message: Events.FAILED_TO_FIND_DATAQUERY
    })
    return [{
      _id: id,
      message: Events.FAILED_TO_FIND_DATAQUERY
    }]
  }
}
