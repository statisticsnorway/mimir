import { QueryResponse } from 'enonic-types/content'
import { Response } from 'enonic-types/controller'

const {
  query
} = __non_webpack_require__('/lib/xp/content')

exports.get = (): Response => {
  const subtopics: QueryResponse<Subtopics> = query({
    count: 1000,
    query: `components.page.config.mimir.default.subjectType LIKE "subSubject"`
  })

  return {
    body: {
      count: subtopics.count,
      total: subtopics.total,
      hits: subtopics.hits.map(({
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

interface Subtopics {
  count: string;
  total: string;
  hits: Array<Subtopic>;
}

interface Subtopic {
  id: string;
  displayName: string;
  description: string;
}
