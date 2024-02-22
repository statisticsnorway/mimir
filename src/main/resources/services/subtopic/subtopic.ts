import { query } from '/lib/xp/content'

export const get = (req: XP.Request): XP.Response => {
  const subtopicQuery = query({
    count: 1000,
    query: `components.page.config.mimir.default.subjectType LIKE "subSubject"`,
  })
  const subtopicHits = req.params.query
    ? subtopicQuery.hits.filter((subtopic) =>
        subtopic.displayName.toLowerCase().includes((req.params.query as string).toLowerCase())
      )
    : subtopicQuery.hits

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
