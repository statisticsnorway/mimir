import { enGB, nb, nn } from 'date-fns/locale'
import { format, parseISO } from 'date-fns'

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

export function formatDateNew(date: string | undefined, language?: string): string | undefined {
  //Norsk: 7. februar 2023
  //Engelsk: 7 February 2023
  if (date) {
    const parsedDate: Date = new Date(date)
    const day: number = parsedDate.getDate()
    const month: number = parsedDate.getMonth()
    const year: number = parsedDate.getFullYear()
    const monthName: string = getMonthNameLong(month, language)
    const dayFormatted = language === 'en' ? day : `${day}.`

    return `${dayFormatted} ${monthName} ${year}`
  }
  return
}

export function formatDateTime(date: string | undefined, language?: string): string | undefined {
  //Norsk: 7. feb. 2023 09:00
  //Engelsk: 7 Feb 2023, 09:00
  if (date) {
    const parsedDate: Date = new Date(date)
    const hour: number = parsedDate.getHours()
    const minute: number = parsedDate.getMinutes()
    const day: number = parsedDate.getDate()
    const month: number = parsedDate.getMonth()
    const year: number = parsedDate.getFullYear()
    const monthName: string = getMonthNameShort(month, language)
    const hourFormatted = hour < 10 ? '0' + hour : hour
    const minuteFormatted = minute < 10 ? '0' + minute : minute
    const dayFormatted = language === 'en' ? day : `${day}.`
    const yearFormatted = language === 'en' ? `${year},` : year

    return `${dayFormatted} ${monthName} ${yearFormatted} ${hourFormatted}:${minuteFormatted}`
  }
  return
}

export function stringToServerTime(): Date {
  const serverOffsetInMs: number =
    app.config && app.config['serverOffsetInMs'] ? parseInt(app.config['serverOffsetInMs']) : 0
  return new Date(new Date().getTime() + serverOffsetInMs)
}

export function getMonthNameShort(month: string | number, language?: string) {
  const monthNumber = typeof month === 'string' ? parseInt(month) : month
  const months =
    language === 'en'
      ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      : ['jan.', 'feb.', 'mar.', 'apr.', 'mai.', 'jun.', 'jul.', 'aug.', 'sep.', 'okt.', 'nov.', 'des.']
  return months[monthNumber]
}

export function getMonthNameLong(month: string | number, language?: string) {
  const monthNumber = typeof month === 'string' ? parseInt(month) : month
  const months =
    language === 'en'
      ? [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ]
      : [
          'januar',
          'februar',
          'mars',
          'april',
          'mai',
          'juni',
          'juli',
          'august',
          'september',
          'oktober',
          'november',
          'desember',
        ]
  return months[monthNumber]
}

export function createMonthName(monthNumber: string, language?: string) {
  const months =
    language === 'en'
      ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      : ['jan.', 'feb.', 'mar.', 'apr.', 'mai.', 'jun.', 'jul.', 'aug.', 'sep.', 'okt.', 'nov.', 'des.']
  return months[parseInt(monthNumber)]
}

export interface DateUtilsLib {
  sameDay: (d1: Date, d2: Date) => boolean
  formatDate: (date: string | undefined, formatType: string, language: string) => string | undefined
  formatDateNew: (date: string | undefined, language: string) => string | undefined
  formatDateTime: (date: string | undefined, language: string) => string | undefined
  stringToServerTime: () => Date
  createMonthName: (monthNumber: string, language: string) => string
}
