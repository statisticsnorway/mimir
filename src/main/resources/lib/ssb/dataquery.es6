const { query } = __non_webpack_require__( '/lib/xp/content')
const { NOT_FOUND } = __non_webpack_require__( './error')

const contentTypeName = `${app.name}:dataquery`

export const get = (key) => {
  const queryString = `_id = '${key.key}'`
  const content = query({
    contentTypes: [contentTypeName],
    query: queryString
  })
  return content.count === 1 ? { ...content.hits[0], status: 200 } : NOT_FOUND
}
