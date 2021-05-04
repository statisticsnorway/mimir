export const STAT_REG_SVC_PROP: string = 'ssb.statreg.baseUrl'

export const CONTACTS_URL: string = `/kontakt/listSomXml`
export const STATISTICS_URL: string = `/statistics`
export const PUBLICATIONS_URL: string = `/publisering/listSomXml`
export const ALL_DATA_URL: string = `/*/listSomXml`

export const STATREG_REPO: string = 'no.ssb.statreg'
export const STATREG_BRANCH: string = 'master'

export function getStatRegBaseUrl(): string {
  return (app.config && app.config[STAT_REG_SVC_PROP]) || 'https://i.ssb.no/statistikkregisteret'
}

export interface StatRegConfigLib {
  STAT_REG_SVC_PROP: string;
  CONTACTS_URL: string;
  STATISTICS_URL: string;
  PUBLICATIONS_URL: string;
  ALL_DATA_URL: string;
  STATREG_REPO: string;
  STATREG_BRANCH: string;
  getStatRegBaseUrl: () => string;
}
