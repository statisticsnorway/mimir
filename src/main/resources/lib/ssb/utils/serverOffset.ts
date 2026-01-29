import { Instant, ZoneId, ZonedDateTime } from '/lib/time'

const TARGET_TIME_ZONE = 'Europe/Oslo'
/**
 * Returns the millisecond offset needed to convert runtime-local time
 * to the target time zone (DST-aware, no manual config).
 *
 * Computes the delta between runtime-local timezone and the target timezone.
 * Ensures offset = 0 when running locally in Europe/Oslo.
 */
export function getServerOffsetInMs(referenceDate: Date = new Date()): number {
  const instant = Instant.ofEpochMilli(referenceDate.getTime())
  const zoneId = ZoneId.of(TARGET_TIME_ZONE)
  const zonedDateTime = ZonedDateTime.ofInstant(instant, zoneId)

  const targetOffsetMs = zonedDateTime.getOffset().getTotalSeconds() * 1000

  // getTimezoneOffset() returns UTC relative to local time (UTC - local) in minutes, so negate it to get (local - UTC),
  // then convert from minutes to milliseconds
  const runtimeLocalOffsetMs = -referenceDate.getTimezoneOffset() * 60_000

  return targetOffsetMs - runtimeLocalOffsetMs
}
