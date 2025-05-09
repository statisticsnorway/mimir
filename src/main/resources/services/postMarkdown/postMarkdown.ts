import { connectMarkdownRepo } from '/lib/ssb/utils/markdownUtils'

export const post = (req: XP.Request): XP.Response => {
  const data = JSON.parse(req.body)

  const conn = connectMarkdownRepo()

  const nodeId = typeof data._id === 'string' ? data._id : ''
  const nodeExists = nodeId ? conn.exists(nodeId) : false

  let result
  if (nodeExists) {
    result = conn.modify({
      key: nodeId,
      editor: (node) => ({
        ...node,
        ...data,
      }),
    })
  } else {
    result = conn.create(data)
  }

  return {
    status: 200,
    body: result,
    contentType: 'application/json',
  }
}
