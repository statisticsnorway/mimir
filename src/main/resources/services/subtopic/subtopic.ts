import { query, Content, QueryResponse } from '/lib/xp/content'

exports.get = (req: XP.Request): XP.Response => {
  const subtopicQuery: QueryResponse<Subtopics, object> = query({
    count: 1000,
    query: `components.page.config.mimir.default.subjectType LIKE "subSubject"`,
  })
  const subtopicHits: Array<Content> = req.params.query
    ? subtopicQuery.hits.filter((subtopic) =>
        subtopic.displayName.toLowerCase().includes((req.params.query as string).toLowerCase())
      )
    : (subtopicQuery.hits as Array<Content>)

  return {
    body: {
      count: subtopicHits.length,
      total: subtopicHits.length,
      hits: subtopicHits.map(({ _id, displayName, _path }) => {
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

interface Subtopics {
  count: string
  total: string
  hits: Array<Subtopic>
}

interface Subtopic {
  id: string
  displayName: string
  description: string
}
