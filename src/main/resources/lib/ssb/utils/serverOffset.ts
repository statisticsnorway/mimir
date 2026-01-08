import { getTimezoneOffset } from '/lib/vendor/dateFns'

/**
 * Calculates serverOffsetInMs so server-local timestamps behave as if the server was running in the target time zone.
 *
 * Winter (Oslo):  3600000
 * Summer (Oslo):  7200000
 */
export function getServerOffsetInMs(targetTimeZone: string = 'Europe/Oslo', referenceDate: Date = new Date()): number {
  // Offset from UTC for the target time zone (ms)
  const targetOffsetMs = getTimezoneOffset(targetTimeZone, referenceDate)

  const serverLocalOffsetMinutes = referenceDate.getTimezoneOffset()
  // getTimezoneOffset returns (UTC - local) in minutes
  const serverLocalOffsetMs = -serverLocalOffsetMinutes * 60_000
  return targetOffsetMs - serverLocalOffsetMs
}
