import { find } from '/lib/xp/auditlog'
import { get as getContent } from '/lib/xp/content'
import { run } from '/lib/xp/context'
import { ENONIC_CMS_DEFAULT_REPO } from '/lib/ssb/repo/common'

interface PublishLogEntry {
  time: string
  user: string
  data: {
    params?: { contentIds?: string | string[] }
    result?: { pushedContents?: string | string[]; failedContents?: string | string[] }
  }
}

function toArray(value?: string | string[]): string[] {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

function describeContent(id: string): string {
  const content = run({ repository: ENONIC_CMS_DEFAULT_REPO, branch: 'draft', principals: ['role:system.admin'] }, () =>
    getContent({ key: id })
  )
  return content ? `${content.displayName} (${content._path}) [${id}]` : `<not found> [${id}]`
}

function formatList(label: string, ids: string[]): string {
  return `  ${label} (${ids.length}):${ids.map((id) => `\n    - ${describeContent(id)}`).join('')}`
}

export function findAuditlogDuringMigration() {
  const result = run({ principals: ['role:system.admin'] }, () =>
    find({
      count: 10000,
      // from: '2026-11-10T11:00:00.000Z',
      // to: '2026-11-10T11:15:00.000Z',
      from: '2026-11-16T13:10:00.000Z',
      to: '2026-11-16T13:17:00.000Z',
      type: 'system.content.publish',
      users: ['user:system:su'],
    })
  )

  let totalPushed = 0
  let totalFailed = 0
  const entries = (result.hits as PublishLogEntry[]).map((entry) => {
    const { data } = entry
    const requested = toArray(data.params?.contentIds)
    const pushed = toArray(data.result?.pushedContents)
    const failed = toArray(data.result?.failedContents)
    totalPushed += pushed.length
    totalFailed += failed.length
    return [
      `${entry.time} ${entry.user} — pushed: ${pushed.length}, failed: ${failed.length}`,
      formatList('Requested', requested),
      formatList('Pushed', pushed),
      formatList('Failed', failed),
    ].join('\n')
  })

  log.info(
    `Auditlog: ${result.total} publish entries, ${totalPushed} pushed, ${totalFailed} failed\n${entries.join('\n\n')}`
  )
}
