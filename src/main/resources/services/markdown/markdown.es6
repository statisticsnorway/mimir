const {
  getMarkdownRepo
} = __non_webpack_require__('../post/post')
const {
  getNode
} = __non_webpack_require__('/lib/ssb/repo/common')

exports.get = () => {
  const markdownFileIds = getMarkdownRepo().hits.map((node) => `${node.id}`)
  const markdownContent = markdownFileIds.map((id) => getNode('no.ssb.pubmd', 'master', id))
  const total = markdownContent.length

  return {
    body: {
      count: total,
      total: total,
      hits: markdownContent.map(({_id, _name}) => {
        return {
          id: _id,
          displayName: _name
        }
      })
    },
    contentType: 'application/json'
  }
}
