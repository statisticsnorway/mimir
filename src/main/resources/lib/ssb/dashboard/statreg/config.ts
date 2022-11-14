export const STAT_REG_SVC_PROP = 'ssb.statreg.baseUrl'

export const CONTACTS_URL = `/kontakt/listSomXml`
export const STATISTICS_URL = `/statistics`
export const PUBLICATIONS_URL = `/publisering/listSomXml`
export const ALL_DATA_URL = `/*/listSomXml`

export const STATREG_REPO = 'no.ssb.statreg'
export const STATREG_BRANCH = 'master'

export function getStatRegBaseUrl(): string {
  return (app.config && app.config[STAT_REG_SVC_PROP]) || 'https://i.ssb.no/statistikkregisteret'
}

export interface StatRegConfigLib {
  STAT_REG_SVC_PROP: string
  CONTACTS_URL: string
  STATISTICS_URL: string
  PUBLICATIONS_URL: string
  ALL_DATA_URL: string
  STATREG_REPO: string
  STATREG_BRANCH: string
  getStatRegBaseUrl: () => string
}
