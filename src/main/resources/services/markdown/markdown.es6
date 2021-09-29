const {
  query
} = __non_webpack_require__('/lib/xp/content')
const {
  getMarkdownRepo
} = __non_webpack_require__('../post/post')

exports.get = () => {
  const markdownFileIds = getMarkdownRepo().hits.map((node) => `'${node.id}'`)
  log.info(JSON.stringify(getMarkdownRepo().hits, null, 2))
  log.info(JSON.stringify(`_id IN(${markdownFileIds.join(',')})`, null, 2))

  const markdownFiles = query({
    count: 1000,
    query: `_id IN(${markdownFileIds.join(',')})`
  })
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
