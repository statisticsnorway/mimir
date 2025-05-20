import { connectMarkdownRepo } from '/lib/ssb/utils/markdownUtils'

export const post = (req: XP.Request): XP.Response => {
  const json = req?.body ? JSON.parse(req.body) : {}

  const data = {
    markdown: json.markdown,
    displayName: json.displayName,
  }

  const conn = connectMarkdownRepo()

  const nodeId = typeof json._id === 'string' ? json._id : ''
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
