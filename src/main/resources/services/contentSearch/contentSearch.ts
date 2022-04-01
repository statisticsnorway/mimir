import { Content, QueryResponse } from 'enonic-types/content'
import { Request, Response } from 'enonic-types/controller'

const {
  query
} = __non_webpack_require__('/lib/xp/content')

exports.get = (req: Request): Response | object => {
  const queryString: string = req.params.query ? req.params.query : ''
  const result: QueryResponse<Content> = query({
    start: 0,
    count: 10,
    sort: 'modifiedTime DESC',
    query: `fulltext('_alltext', '${queryString}', 'AND')`,
    contentTypes: [
      `${app.name}:page`,
      `${app.name}:article`,
      `${app.name}:statistics`
    ]
  })
  if (result && result.hits) {
    const response: object = {
      body: {
        hits: result.hits.map((hit) => ({
          value: hit._id,
          label: `${hit.displayName} - ${hit._path}`,
          title: hit.displayName
        }))
      }
    }
    return response
  } else {
    return {
      'result': []
    }
  }
}

