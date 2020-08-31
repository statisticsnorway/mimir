import { getStatRegFetchStatuses } from '../../lib/repo/statreg'

exports.get = () => {
  return {
    contentType: 'application/json',
    body: getStatRegFetchStatuses(),
    status: 200
  }
}
