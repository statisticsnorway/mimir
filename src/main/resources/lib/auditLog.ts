import { find } from '/lib/xp/auditlog'
import { run } from '/lib/xp/context'

export function findAuditlogDuringMigration() {
  // The system.auditlog repo is only readable by admins, and main.js runs as anonymous
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
  log.info(`Auditlog: found ${result.total} entries: ${JSON.stringify(result.hits, null, 2)}`)
}
