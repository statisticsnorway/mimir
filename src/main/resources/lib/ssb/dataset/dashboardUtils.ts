import { User } from 'enonic-types/auth'
import { Events } from '../../repo/query'

export const users: Array<User> = []

export function showWarningIcon(result: Events): boolean {
  return [
    Events.FAILED_TO_GET_DATA,
    Events.REQUEST_GOT_ERROR_RESPONSE,
    Events.FAILED_TO_CREATE_DATASET,
    Events.FAILED_TO_REFRESH_DATASET
  ].includes(result)
}

export interface DashboardUtilsLib {
    users: Array<User>;
    showWarningIcon: (result: Events) => boolean;
}
