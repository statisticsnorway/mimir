import { query } from '/lib/xp/content'
import { getContent } from '/lib/xp/portal'

export const list = () => {
  const now = new Date()

  return query({
    contentTypes: [`${app.name}:operationsAlert`],
    query: `publish.from LIKE '*' AND (publish.to NOT LIKE '*' OR publish.to > '${now.toISOString()}')`,
    filters: {
      boolean: {
        must: [
          {
            hasValue: {
              field: 'language',
              values: getContent()?.language === 'en' ? ['en'] : ['no', 'nb', 'nn'],
            },
          },
        ],
      },
      notExists: {
        field: 'data.municipalCodes',
      },
    },
  })
}
