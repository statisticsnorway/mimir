import { type Locale } from 'date-fns'
import { default as nb } from 'date-fns/locale/nb'
import { default as nn } from 'date-fns/locale/nn'
import { default as enGB } from 'date-fns/locale/en-GB'
import { default as parseISO } from 'date-fns/parseISO'
import { default as format } from 'date-fns/format'
import { default as isWithinInterval } from 'date-fns/isWithinInterval'
import { default as subDays } from 'date-fns/subDays'
import { default as getMonth } from 'date-fns/getMonth'
import { default as getYear } from 'date-fns/getYear'
import { default as getDate } from 'date-fns/getDate'
import { default as isAfter } from 'date-fns/isAfter'
import { default as isBefore } from 'date-fns/isBefore'
import { default as isSameDay } from 'date-fns/isSameDay'
import { default as isSameSecond } from 'date-fns/isSameSecond'
import { default as formatDistanceToNowStrict } from 'date-fns/formatDistanceToNowStrict'

export {
  parseISO,
  subDays,
  getMonth,
  format,
  getYear,
  getDate,
  isAfter,
  isBefore,
  isSameDay,
  isSameSecond,
  isWithinInterval,
}

export function sameDay(d1: Date, d2: Date): boolean {
  return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear()
}

export function formatDate(date: string | undefined, formatType: string, language?: string): string | undefined {
  if (date) {
    const parsedDate: Date = parseISO(date)
    const locale: object = language
      ? {
          locale: language === 'en' ? enGB : language === 'nn' ? nn : nb,
        }
      : {}

    try {
      const result = format(parsedDate, formatType, locale)
      return result
    } catch (e) {
      log.error(`Error in formatDate, tried to format ${parsedDate} to ${formatType}`)
      log.error(JSON.stringify(locale, null, 2))
      throw e
    }
  }
  return
}

export function stringToServerTime(): Date {
  const serverOffsetInMs: number =
    app.config && app.config['serverOffsetInMs'] ? parseInt(app.config['serverOffsetInMs']) : 0
  return new Date(new Date().getTime() + serverOffsetInMs)
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

export function isSameOrAfter(date1: Date, date2: Date, unit?: string): boolean {
  return unit === 'day'
    ? isAfter(date1, date2) || isSameDay(date1, date2)
    : isAfter(date1, date2) || isSameSecond(date1, date2)
}

export function fromNow(date: string, language?: string): string {
  const locale: Locale = language ? (language === 'en' ? enGB : language === 'nn' ? nn : nb) : nb
  return formatDistanceToNowStrict(new Date(date), { addSuffix: true, locale })
}

export type DateUtilsLib = typeof import('./dateUtils')
