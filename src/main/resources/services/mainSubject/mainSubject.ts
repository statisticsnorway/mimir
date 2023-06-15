import { query } from '/lib/xp/content'

exports.get = (): XP.Response => {
  const mainSubjects = query({
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
