import { Instant, ZoneId, ZonedDateTime } from '/lib/time'

export function getServerOffsetInMs(targetTimeZone: string = 'Europe/Oslo', referenceDate: Date = new Date()): number {
  const instant = Instant.ofEpochMilli(referenceDate.getTime())
  const zoneId = ZoneId.of(targetTimeZone)
  const zonedDateTime = ZonedDateTime.ofInstant(instant, zoneId)
  const targetOffsetMs = zonedDateTime.getOffset().getTotalSeconds() * 1000
  const runtimeLocalOffsetMs = -referenceDate.getTimezoneOffset() * 60_000
  return targetOffsetMs - runtimeLocalOffsetMs
}
