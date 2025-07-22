import { connectMarkdownRepo } from '/lib/ssb/utils/markdownUtils'

export const post = (req: XP.Request): XP.Response => {
  const json = req?.body ? JSON.parse(req.body) : {}

  const data = {
    markdown: json.markdown ?? '',
    displayName: json.displayName ?? '',
  }

  const conn = connectMarkdownRepo()

  const nodeId = typeof json._id === 'string' ? json._id : ''
  const nodeExists = nodeId ? conn.exists(nodeId) : false

  let node
  if (nodeExists) {
    node = conn.modify({
      key: nodeId,
      editor: (node) => ({
        ...node,
        ...data,
      }),
    })
  } else {
    node = conn.create(data)
  }

  const body = {
    _id: node._id,
  }

  return {
    status: 200,
    body: body,
    contentType: 'application/json',
  }
}
