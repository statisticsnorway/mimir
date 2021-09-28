const nodeLib = __non_webpack_require__('/lib/xp/node')

export function post(req) {
  log.info(req.body)
  const repo = connect()
  const nodeExists = req.params.path && repo.exists(req.params.path + '/' + req.params.name)
  if (nodeExists) {
    repo.modify({
      key: req.params.path + '/' + req.params.name,
      editor: (node) => {
        node.displayName = 'pow it is the most edited markdown',
        node.markdown = req.body
        return node
      }
    })
  } else {
    const result1 = repo.create({
      _name: req.params.name,
      _parentPath: req.params.path,
      displayName: 'wow it is the best markdown',
      markdown: req.body

    })
    log.info(JSON.stringify(result1, null, 2))
  }
}

export function getMarkdownRepo() {
  return connect().findChildren({
    parentKey: '/'
  })
}

const connect = function() {
  return nodeLib.connect({
    repoId: 'no.ssb.pubmd',
    branch: 'master',
    principals: ['role:system.admin']
  })
}
