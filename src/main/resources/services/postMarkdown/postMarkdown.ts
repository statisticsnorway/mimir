import { create as createContent, exists as existsContent, get as getContent } from '/lib/xp/content'
import { get as getContext, run as runWithContext } from '/lib/xp/context'
import { type RepoConnection } from '/lib/xp/node'
import { type ContextCallback } from '/lib/ssb/repo/common'
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

  let previewId = typeof node.previewId === 'string' ? node.previewId : ''
  const previewExists = previewId
    ? withDraftContext(() =>
        existsContent({
          key: previewId,
        })
      )
    : false
  if (!previewExists) {
    previewId = createPreview(conn, node._id, node.displayName)
  }

  const body = {
    _id: node._id,
    previewPath: getPreviewPath(previewId),
  }

  return {
    status: 200,
    body: body,
    contentType: 'application/json',
  }
}

function getPreviewPath(previewId: string): string {
  const content = withDraftContext(() =>
    getContent({
      key: previewId,
    })
  )
  const contentPath = content?._path ?? ''
  return '/admin/site/preview/default/draft' + contentPath
}

function createPreview(conn: RepoConnection, nodeId: string, displayName: string): string {
  const page = withDraftContext(() =>
    createContent({
      displayName: displayName,
      parentPath: '/ssb/pubmd',
      contentType: 'mimir:markdown',
      workflow: {
        state: 'IN_PROGRESS',
      },
      data: {
        nodeId: nodeId,
      },
    })
  )

  conn.modify({
    key: nodeId,
    editor: (node) => ({
      ...node,
      previewId: page._id,
    }),
  })

  return page._id
}

function withDraftContext<T>(callback: ContextCallback<T>): T {
  const draftContext = getContext()
  draftContext.branch = 'draft'
  return runWithContext(draftContext, callback)
}
