import { connect } from '/lib/xp/node'

export const post = (req: XP.Request): XP.Response => {
  const params = {
    displayName: req.params.displayName,
    markdown: req.params.markdown,
  }

  const conn = connect({
    repoId: 'no.ssb.pubmd',
    branch: 'master',
    principals: ['role:system.admin'],
  })

  const nodeId = typeof req.params._id === 'string' ? req.params._id : ''
  const nodeExists = nodeId ? conn.exists(nodeId) : false

  let result
  if (nodeExists) {
    result = conn.modify({
      key: nodeId,
      editor: (node) => ({
        ...node,
        ...params,
      }),
    })
  } else {
    result = conn.create(params)
  }

  return {
    status: 200,
    body: result,
    contentType: 'application/json',
  }
}
