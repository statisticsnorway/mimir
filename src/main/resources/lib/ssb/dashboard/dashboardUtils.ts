import { User } from '/lib/xp/auth'
import { Content } from '/lib/xp/content'
import { Events } from '/lib/ssb/repo/query'
import { DataSource } from '/site/mixins/dataSource'

/**
 * The timestamp from enonic contains 6 millisecond decimals. This is not supported in
 * today's nashorn and therefor it cannot create new date object with it. This function
 * removes the last 3 digits.
 * @param {string} timestamp in iso format: 2020-10-14T08:15:24.307260Z
 * @return {string} timestamp in iso format: 2020-10-14T08:15:24.307Z
 */
function removeLast3Digits(timestamp: string): string {
  const groupRegexp = /([0-9\-]{8,10}T[0-9\:]{6,8}.[0-9]{3})(?:[0-9])*(Z)/gm
  const matched: Array<string> | null = groupRegexp.exec(timestamp)
  return matched && matched.length > 1 ? `${matched[1]}${matched[2]}` : timestamp
}

export function isPublished(content: Content): boolean {
  return content.publish && content.publish.from
    ? new Date(removeLast3Digits(content.publish.from)) < new Date()
    : false
}

export const users: Array<User> = []

export const WARNING_ICON_EVENTS: ReadonlyArray<Events> = [
  Events.FAILED_TO_GET_DATA,
  Events.REQUEST_GOT_ERROR_RESPONSE,
  Events.FAILED_TO_CREATE_DATASET,
  Events.FAILED_TO_REFRESH_DATASET,
]

export function showWarningIcon(result: Events): boolean {
  return WARNING_ICON_EVENTS.includes(result)
}
