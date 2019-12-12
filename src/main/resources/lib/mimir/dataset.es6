const { query } = __non_webpack_require__( '/lib/xp/content')
const { NOT_FOUND } = __non_webpack_require__( './error')

const contentTypeName = `${app.name}:dataset`

export const get = (key) => {
  const content = query({
    contentTypes: [contentTypeName],
    query: `_id = '${key.key}'`
  });
  return content.count === 1 ? {...content.hits[0], status: 200} : NOT_FOUND
}

/**
 * Get the last created dataset with dataQuery content id
 * @param {string} dataQueryContentId
 * @return {object}
 */
export const getDataSetWithDataQueryId = (dataQueryContentId) => query({
  count: 1,
  contentTypes: [contentTypeName],
  sort: 'createdTime DESC',
  query: `data.dataquery = '${dataQueryContentId}'`
})
