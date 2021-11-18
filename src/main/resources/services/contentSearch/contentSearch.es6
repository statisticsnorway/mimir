
const contentLib = __non_webpack_require__('/lib/xp/content')

exports.get = (req) => {
  const query = req.params.query ? req.params.query : ''
  const result = contentLib.query({
    start: 0,
    count: 10,
    sort: 'modifiedTime DESC',
    query: `fulltext('_alltext', '${query}', 'AND')`,
    contentTypes: [
      app.name + ':page',
      `${app.name}:article`,
      `${app.name}:statistics`
    ]
  })
  if (result && result.hits) {
    const response = {
      body: {
        hits: result.hits.map((hit) => ({
          value: hit._id,
          label: hit.displayName
        })
        )
      }
    }
    return response
  } else {
    return {
      'result': []
    }
  }
}

