export const STAT_REG_SVC_PROP = 'ssb.statreg.baseUrl'

export const CONTACTS_URL = `/kontakt/listSomXml`
export const STATISTICS_URL = `/statistics`
export const PUBLICATIONS_URL = `/publisering/listSomXml`
export const ALL_DATA_URL = `/*/listSomXml`

export const STATREG_REPO = 'no.ssb.statreg'
export const STATREG_BRANCH = 'master'

export function getStatRegBaseUrl(): string {
  return app.config?.[STAT_REG_SVC_PROP] || 'https://i.ssb.no/statistikkregisteret'
}
