import { query, QueryResponse } from '/lib/xp/content'

exports.get = (): XP.Response => {
  const mainSubjects: QueryResponse<MainSubjects, object> = query({
    count: 500,
    filters: {
      boolean: {
        must: [
          {
            hasValue: {
              field: 'components.page.config.mimir.default.subjectType',
              values: ['mainSubject'],
            },
          },
        ],
      },
    },
  })

  return {
    body: {
      count: mainSubjects.count,
      total: mainSubjects.total,
      hits: mainSubjects.hits.map(({ _id, displayName, _path }) => {
        return {
          id: _id,
          displayName,
          description: _path,
        }
      }),
    },
    contentType: 'application/json',
  }
}

interface MainSubjects {
  count: string
  total: string
  hits: Array<MainSubject>
}

interface MainSubject {
  id: string
  displayName: string
  description: string
}
