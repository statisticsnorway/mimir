import { connectMarkdownRepo } from '/lib/ssb/utils/markdownUtils'

export const post = (req: XP.Request): XP.Response => {
  const params = {
    displayName: req.params.displayName,
    markdown: req.params.markdown,
  }

  const conn = connectMarkdownRepo()

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
