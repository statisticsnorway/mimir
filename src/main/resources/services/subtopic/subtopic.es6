const {
  query
} = __non_webpack_require__('/lib/xp/content')

exports.get = () => {
  const subtopics = query({
    count: 1000,
    contentType: `${app.name}:page`,
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
