import { enGB, nb, nn } from 'date-fns/locale'
import { parseISO, format } from 'date-fns'

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

export interface DateUtilsLib {
  sameDay: (d1: Date, d2: Date) => boolean
  formatDate: (date: string | undefined, formatType: string, language: string) => string | undefined
}
