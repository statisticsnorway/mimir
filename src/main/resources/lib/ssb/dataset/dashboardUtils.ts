import { User } from 'enonic-types/auth'
import { Events } from '../../repo/query'

export const users: Array<User> = []

export const WARNING_ICON_EVENTS: ReadonlyArray<Events> = [
  Events.FAILED_TO_GET_DATA,
  Events.REQUEST_GOT_ERROR_RESPONSE,
  Events.FAILED_TO_CREATE_DATASET,
  Events.FAILED_TO_REFRESH_DATASET
]

export function showWarningIcon(result: Events): boolean {
  return WARNING_ICON_EVENTS.includes(result)
}

export interface DashboardUtilsLib {
  WARNING_ICON_EVENTS: ReadonlyArray<Events>;
  users: Array<User>;
  showWarningIcon: (result: Events) => boolean;
}
