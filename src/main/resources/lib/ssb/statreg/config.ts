export const STAT_REG_SVC_PROP: string = 'ssb.statreg.baseUrl'
export const STAT_REG: string = `${app.config && app.config[STAT_REG_SVC_PROP]}`

export const CONTACTS_URL: string = `${STAT_REG}/kontakt/listSomXml`
export const CONTACT_NAMES_URL: string = `${STAT_REG}/kontakt/hentNavn`

export const STATISTICS_URL: string = `${STAT_REG}/statistikk/listSomXml`
