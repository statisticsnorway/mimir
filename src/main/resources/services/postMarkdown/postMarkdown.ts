import { exists as existsContent } from '/lib/xp/content'
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

  const previewId = typeof node.previewId === 'string' ? node.previewId : ''
  const previewExists = previewId
    ? existsContent({
        key: previewId,
      })
    : false

  log.info(previewExists)

  const body = {
    _id: node._id,
  }

  return {
    status: 200,
    body: body,
    contentType: 'application/json',
  }
}
