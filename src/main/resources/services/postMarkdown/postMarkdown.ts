import { connectMarkdownRepo } from '/lib/ssb/utils/markdownUtils'

export const post = (req: XP.Request): XP.Response => {
  const setFields = (obj) => {
    obj.displayName = req.params.displayName
    obj.markdown = req.params.markdown
    return obj
  }

  const conn = connectMarkdownRepo()

  const nodeId = typeof req.params._id === 'string' ? req.params._id : ''
  const nodeExists = nodeId ? conn.exists(nodeId) : false

  let result
  if (nodeExists) {
    result = conn.modify({
      key: nodeId,
      editor: setFields,
    })
  } else {
    const createContentParams = setFields({})
    result = conn.create(createContentParams)
  }

  return {
    status: 200,
    body: result,
  }
}
