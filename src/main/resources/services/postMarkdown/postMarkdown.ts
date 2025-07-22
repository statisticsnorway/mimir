import { exists as existsContent, get as getContent } from '/lib/xp/content'
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

  let previewPath: string
  if (previewExists) {
    previewPath = getPreviewPath(previewId)
  } else {
    previewPath = ''
  }

  const body = {
    _id: node._id,
    previewPath: previewPath,
  }

  return {
    status: 200,
    body: body,
    contentType: 'application/json',
  }
}

function getPreviewPath(previewId: string): string {
  const content = getContent({
    key: previewId,
  })
  const contentPath = content?._path ?? ''
  return '/admin/site/preview/default/draft' + contentPath
}
