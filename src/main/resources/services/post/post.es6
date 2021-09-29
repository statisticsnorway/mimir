const nodeLib = __non_webpack_require__('/lib/xp/node')

export function post(req) {
  log.info(req.body)
  const repo = connect()
  const path = req.params.path ? req.params.path : '/'
  const nodeKey = req.params.path ? req.params.path + '/' + req.params.name : '/' + req.params.name
  const nodeExists = repo.exists(nodeKey)
  if (nodeExists) {
    repo.modify({
      key: nodeKey,
      editor: (node) => {
        node.displayName = 'pow it is the most edited markdown',
        node.markdown = req.body
        return node
      }
    })
  } else {
    const result1 = repo.create({
      _name: req.params.name,
      _parentPath: path,
      displayName: 'wow it is the best markdown',
      markdown: req.body

    })
    log.info(JSON.stringify(result1, null, 2))
  }
}

const connect = function() {
  return nodeLib.connect({
    repoId: 'no.ssb.pubmd',
    branch: 'master',
    principals: ['role:system.admin']
  })
}
