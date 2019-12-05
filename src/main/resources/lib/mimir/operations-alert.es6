import { query } from '/lib/xp/content'
import { getContent } from '/lib/xp/portal'

const contentTypeName = `${app.name}:operations-alert`

export const list = () => {
  const now = new Date()
  return query({
    contentTypes: [contentTypeName],
    query: `language = '${getContent().language}' AND (publish.to NOT LIKE '*' OR publish.to > '${now.toISOString()}')`,
    filters: {
      notExists: {
        field: 'data.municipalCodes'
      }
    }
  })
}
