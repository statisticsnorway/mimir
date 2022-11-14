const { query } = __non_webpack_require__('/lib/xp/content')
const { getContent } = __non_webpack_require__('/lib/xp/portal')

const contentTypeName = `${app.name}:operationsAlert`

export const list = () => {
  const now = new Date()
  return query({
    contentTypes: [contentTypeName],
    query: `language = '${
      getContent().language
    }' AND publish.from LIKE '*' AND (publish.to NOT LIKE '*' OR publish.to > '${now.toISOString()}')`,
    filters: {
      notExists: {
        field: 'data.municipalCodes',
      },
    },
  })
}
