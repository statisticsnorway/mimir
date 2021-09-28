// const {
//   getVersion


// } = __non_webpack_require__('/lib/xp/admin')
const nodeLib = __non_webpack_require__('/lib/xp/node')

export function post(req) {
  log.info(req.body)
  const connected = connect()
  const result1 = connected.create({
    _name: req.params.name,
    _parentPath: req.params.path,
    displayName: 'wow it is the best markdown',
    markdown: req.body

  })
  log.info(JSON.stringify(result1, null, 2))
}

const connect = function() {
  return nodeLib.connect({
    repoId: 'no.ssb.pubmd',
    branch: 'master',
    principals: ['role:system.admin']
  })
}
