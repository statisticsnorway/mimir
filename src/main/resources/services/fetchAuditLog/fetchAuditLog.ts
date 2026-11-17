import { type Request, type Response } from '@enonic-types/core'
import { find } from '/lib/xp/auditlog'
import { get as getContent } from '/lib/xp/content'
import { run } from '/lib/xp/context'
import { ENONIC_CMS_DEFAULT_REPO } from '/lib/ssb/repo/common'

interface PublishLogEntry {
  _id: string
  time: string
  user: string
  data: {
    params?: { contentIds?: string | string[] }
    result?: { pushedContents?: string | string[]; failedContents?: string | string[] }
  }
}

interface AuditLogRequest extends Request {
  params?: Request['params'] & {
    from?: string
    to?: string
  }
}

function toArray(value?: string | string[]): string[] {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

function describeContent(id: string) {
  const content = run({ repository: ENONIC_CMS_DEFAULT_REPO, branch: 'draft', principals: ['role:system.admin'] }, () =>
    getContent({ key: id })
  )

  return content ? { id, displayName: content.displayName, path: content._path } : { id, displayName: null, path: null }
}

export function get(req: AuditLogRequest): Response {
  const from = req.params?.from || '2026-11-10T11:00:00.000Z'
  const to = req.params?.to || '2026-11-10T11:15:00.000Z'
  const type = req.params?.type || 'system.content.publish'
  const users = req.params?.users || ['user:system:su']

  const result = run({ principals: ['role:system.admin'] }, () =>
    find({
      count: 10000,
      from,
      to,
      type,
      users,
    })
  )

  let totalPushed = 0
  const entries = (result.hits as PublishLogEntry[]).map((entry) => {
    const requested = toArray(entry.data.params?.contentIds)
    const pushed = toArray(entry.data.result?.pushedContents)
    totalPushed += pushed.length

    return {
      requested: requested.map(describeContent),
      pushed: pushed.map(describeContent),
      pushedCount: pushed.length,
    }
  })

  return {
    status: 200,
    body: {
      from,
      to,
      entryCount: result.total,
      pushedCount: totalPushed,
      entries,
    },
    contentType: 'application/json',
  }
}
