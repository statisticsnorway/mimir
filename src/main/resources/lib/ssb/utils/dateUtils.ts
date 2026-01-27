import {
  Locale,
  nb,
  nn,
  enGB,
  parseISO,
  format,
  isBefore,
  isSameDay,
  isSameSecond,
  isWithinInterval,
  formatDistanceToNowStrict,
} from '/lib/vendor/dateFns'
import { DateTimeFormatter, formatDate as libTimeFormatDate, LocalDateTime, ZonedDateTime, ZoneId } from '/lib/time'
import { getServerOffsetInMs } from '/lib/ssb/utils/serverOffset'

export function setDateTimeAsOsloTimeZone(date: string) {
  const localDateTime = LocalDateTime.parse(date)
  const timezone = ZoneId.of('Europe/Oslo')
  const zonedDateTime = ZonedDateTime.of(localDateTime, timezone)
  const offsetDateTime = zonedDateTime.toOffsetDateTime()
  return offsetDateTime.format(DateTimeFormatter.ISO_DATE_TIME)
}

export function formatDate(date: string | undefined, formatType: string, language?: string): string | undefined {
  if (date) {
    const parsedDate: Date = parseISO(date)
    let parsedDateWithTimezone = parsedDate
    let missingTimezone = false

    // If date has no specified timezone, add Z to the end of the string to make it UTC.
    // We want the formated date to show the excact same time as the input, we need to trick both libs to not care about timezones
    if (!date.match(/(?:Z|[+-](?:2[0-3]|[01][0-9]):[0-5][0-9])$/gm)) {
      parsedDateWithTimezone = parseISO(date + 'Z')
      missingTimezone = true
    }
    const locale: object = language
      ? {
          locale: language === 'en' ? enGB : language === 'nn' ? nn : nb,
        }
      : {}

    let dateFnsResult
    try {
      dateFnsResult = format(parsedDate, formatType, locale)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      log.error(`Error in formatDate, tried to format ${parsedDate} to ${formatType}`)
    }

    let libTimePattern = formatType
    // https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/time/format/DateTimeFormatter.html#patterns
    if (formatType === 'PPP') libTimePattern = language === 'en' ? 'd MMMM u' : 'd. MMMM u'
    if (formatType === 'PPp') libTimePattern = language === 'en' ? 'd MMM u, HH:mm' : 'd. MMM u HH:mm'

    let libTimeResult
    try {
      libTimeResult = libTimeFormatDate({
        date: parsedDateWithTimezone.toISOString(),
        pattern: libTimePattern,
        locale: language,
        timezoneId: missingTimezone ? 'GMT+0000' : 'Europe/Oslo',
      })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      log.error(`Error in formatDate with Lib time, tried to format ${parsedDate} to ${libTimePattern}`)
      return dateFnsResult
    }

    // log.info(`${date} -- ${formatType} -- date-fns: ${dateFnsResult}, lib-time: ${libTimeResult}`)

    // Track errors in logs
    if (dateFnsResult && dateFnsResult !== libTimeResult) {
      if (app.config?.['ssb.log.dateFormat'] === 'true') {
        log.info(
          `Error in formatDate, got different result with date-fns and lib-time when formatting (${date} - ${parsedDate}) to ${formatType}. date-fns: ${dateFnsResult}, lib-time: ${libTimeResult}`
        )
      }
    }

    return dateFnsResult || libTimeResult
  }
  return
}

export function stringToServerTime(): Date {
  const serverOffsetInMs: number = getServerOffsetInMs()
  return new Date(Date.now() + serverOffsetInMs)
}

export function getTimeZoneIso(serverOffsetInMs: number): string {
  if (serverOffsetInMs === 0) return 'Z'
  const offsetHours = (serverOffsetInMs / 1000 / 60 / 60).toString()
  const offsetHourPadded = offsetHours.length === 1 ? `0${offsetHours}` : `${offsetHours}`
  return `+${offsetHourPadded}:00`
}

export function createMonthName(monthNumber: string, language?: string) {
  const months =
    language === 'en'
      ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      : ['jan.', 'feb.', 'mar.', 'apr.', 'mai.', 'jun.', 'jul.', 'aug.', 'sep.', 'okt.', 'nov.', 'des.']
  return months[parseInt(monthNumber)]
}

export function isDateBetween(date: string, startDate: string, endDate: string): boolean {
  const dateFnsBetween = isWithinInterval(new Date(date), {
    start: new Date(startDate),
    end: new Date(endDate),
  })
  return dateFnsBetween
}

export function isSameOrBefore(date1: Date, date2: Date, unit?: string): boolean {
  return unit === 'day'
    ? isBefore(date1, date2) || isSameDay(date1, date2)
    : isBefore(date1, date2) || isSameSecond(date1, date2)
}

export function fromNow(date: string, language?: string): string {
  const locale: Locale = language ? (language === 'en' ? enGB : language === 'nn' ? nn : nb) : nb
  return formatDistanceToNowStrict(new Date(date), { addSuffix: true, locale })
}

export type DateUtilsLib = typeof import('./dateUtils')
