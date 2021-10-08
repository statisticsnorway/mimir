import { QueryResponse } from 'enonic-types/content'
import { Response } from 'enonic-types/controller'

const {
  query
} = __non_webpack_require__('/lib/xp/content')

exports.get = (): Response => {
  const mainSubjects: QueryResponse<MainSubjects> = query({
    count: 500,
    query: `components.page.config.mimir.default.subjectType LIKE "mainSubject"`
  })

  return {
    body: {
      count: mainSubjects.count,
      total: mainSubjects.total,
      hits: mainSubjects.hits.map(({
        _id, displayName, _path
      }) => {
        return {
          id: _id,
          displayName,
          description: _path
        }
      })
    },
    contentType: 'application/json'
  }
}

interface MainSubjects {
    count: string;
    total: string;
    hits: Array<MainSubject>;
}

interface MainSubject {
    id: string;
    displayName: string;
    description: string;
}
