const {
  query
} = __non_webpack_require__('/lib/xp/content')
const {
  getMarkdownRepo
} = __non_webpack_require__('../post/post')

exports.get = () => {
  const markdownFiles = query({
    count: 1000,
    query: `_id IN(${getMarkdownRepo().hits.map((node) => `"${node.id}"`).join(',')})`
  })
  log.info(JSON.stringify(getMarkdownRepo().hits, null, 2))
  log.info(JSON.stringify(getMarkdownRepo().hits.map((node) => `"${node.id}"`).join(','), null, 2))
  log.info(JSON.stringify(markdownFiles, null, 2))
  return {
    body: {
      count: markdownFiles.count,
      total: markdownFiles.total,
      hits: markdownFiles.hits.map(({
        _id, name
      }) => {
        return {
          id: _id,
          displayName: name
        }
      })
    },
    contentType: 'application/json'
  }
}
