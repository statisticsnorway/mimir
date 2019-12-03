import { query } from '/lib/xp/content'
import { getContent } from '/lib/xp/portal'

const contentTypeName = `${app.name}:operations-alert`

export const list = () => {
  return query({
    contentTypes: [contentTypeName],
    query: `language = '${getContent().language}'`,
    filters: {
      notExists: {
        field: 'data.municipalCodes'
      }
    }
  })
}
