import { Instant, ZoneId, ZonedDateTime } from '/lib/time'

/**
 * Returns the millisecond offset needed to convert runtime-local time
 * to the target time zone (DST-aware, no manual config).
 */
export function getServerOffsetInMs(targetTimeZone: string = 'Europe/Oslo', referenceDate: Date = new Date()): number {
  const instant = Instant.ofEpochMilli(referenceDate.getTime())
  const zoneId = ZoneId.of(targetTimeZone)
  const zonedDateTime = ZonedDateTime.ofInstant(instant, zoneId)

  const targetOffsetMs = zonedDateTime.getOffset().getTotalSeconds() * 1000

  // getTimezoneOffset(): minutes = (UTC - local), hence the leading minus
  const runtimeLocalOffsetMs = -referenceDate.getTimezoneOffset() * 60_000

  return targetOffsetMs - runtimeLocalOffsetMs
}
