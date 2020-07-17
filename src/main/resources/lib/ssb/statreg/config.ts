export const STAT_REG_SVC_PROP: string = 'ssb.statreg.baseUrl'
export const STAT_REG: string = `${app.config && app.config[STAT_REG_SVC_PROP]}`

export const CONTACTS_URL: string = `${STAT_REG}/kontakt/listSomXml`
// export const STATISTICS_URL: string = `${STAT_REG}/statistikk/listSomXml`
export const STATISTICS_URL: string = `${STAT_REG}/statistikk/listAllePubliserteSomXml`
export const PUBLICATIONS_URL: string = `${STAT_REG}/publisering/listSomXml`
export const ALL_DATA_URL: string = `${STAT_REG}/*/listSomXml`
