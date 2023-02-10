import { default as nb } from 'date-fns/locale/nb'
import { default as nn } from 'date-fns/locale/nn'
import { default as enGB } from 'date-fns/locale/en-GB'
import { default as parseISO } from 'date-fns/parseISO'
import { default as format } from 'date-fns/format'
import { default as isWithinInterval } from 'date-fns/isWithinInterval'
import { default as subDays } from 'date-fns/subDays'
import { default as differenceInDays } from 'date-fns/differenceInDays'
import { default as differenceInMilliseconds } from 'date-fns/differenceInMilliseconds'
import { default as getMonth } from 'date-fns/getMonth'
import { default as getYear } from 'date-fns/getYear'
import { default as getDate } from 'date-fns/getDate'
import { default as isAfter } from 'date-fns/isAfter'
import { default as isBefore } from 'date-fns/isBefore'
import { default as isSameDay } from 'date-fns/isSameDay'
import { default as isSameSecond } from 'date-fns/isSameSecond'

export { parseISO, subDays, getMonth, getYear, getDate, isAfter, isBefore, isSameDay, isSameSecond }

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
    return format(parsedDate, formatType, locale)
  }
  return
}

export function stringToServerTime(): Date {
  const serverOffsetInMs: number =
    app.config && app.config['serverOffsetInMs'] ? parseInt(app.config['serverOffsetInMs']) : 0
  return new Date(new Date().getTime() + serverOffsetInMs)
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
  return unit === 'day' ? differenceInDays(date1, date2) <= 0 : differenceInMilliseconds(date1, date2) <= 0
}

export type DateUtilsLib = typeof import('./dateUtils')

/*export interface DateUtilsLib {
  sameDay: (d1: Date, d2: Date) => boolean
  formatDate: (date: string | undefined, formatType: string, language: string) => string | undefined
  stringToServerTime: () => Date
  createMonthName: (monthNumber: string, language: string) => string
  isDateBetween: (date: string, startDate: string, endDate: string) => boolean
  isSameOrBefore: (date1: Date, date2: Date, unit?: string) => boolean
}*/
