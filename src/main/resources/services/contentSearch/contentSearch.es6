
const contentLib = __non_webpack_require__('/lib/xp/content')

exports.get = (req) => {
  const query = req.params.query ? req.params.query : ''
  const result = contentLib.query({
    start: 0,
    count: 10,
    sort: 'modifiedTime DESC',
    query: `fulltext('_alltext', '${query}', 'AND')`,
    contentTypes: [app.name + ':page']
  })
  // log.info(JSON.stringify(result))
  if (result && result.hits) {
    // log.info('GLNRBN returning hits! Query: ' + query + ' Antall: ' + result.hits.length)
    const response = {
      body: {
        hits: result.hits.map((hit) => ({
          value: hit._id,
          label: hit.displayName
        })
        )
      }
    }
    log.info(JSON.stringify(response, null, 2))
    return response
  } else {
    return {
      'result': []
    }
  }
}

