import { find } from '/lib/xp/auditlog'

export function findAuditlogDuringMigration() {
  return find({
    count: 10000,
    // from: '2026-11-10T11:00:00.000Z',
    // to: '2026-11-10T11:15:00.000Z',
    from: '2026-11-10T11:00:00.000Z',
    to: '2026-11-10T11:15:00.000Z',
    type: 'system.content.publish',
    users: ['user:system:su'],
  })
}
