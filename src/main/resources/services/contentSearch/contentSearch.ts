import { query } from '/lib/xp/content'

export const get = (req: XP.Request): XP.Response | object => {
  const queryString: string = req.params.query ? req.params.query : ''
  const result = query({
    start: 0,
    count: 10,
    sort: 'modifiedTime DESC',
    query: `fulltext('_alltext', '${queryString}', 'AND')`,
    contentTypes: [`${app.name}:page`, `${app.name}:article`, `${app.name}:statistics`],
  })
  if (result?.hits) {
    const response: object = {
      body: {
        hits: result.hits.map((hit) => ({
          value: hit._id,
          label: `${hit.displayName} - ${hit._path}`,
          title: hit.displayName,
        })),
      },
    }
    return response
  } else {
    return {
      result: [],
    }
  }
}
