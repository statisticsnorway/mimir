import { query } from '/lib/xp/content'
import { getContent } from '/lib/xp/portal'

export const alertsForContext = (municipality) => {
    const currentMunicipalityAlerts = municipality ? municipalAlerts( municipality.code ) : {hits: []}
    const alerts = [...siteAlerts().hits, ...currentMunicipalityAlerts.hits]
    return alerts.map( (alert) => ({...alert.data, title: alert.displayName}))
}

export const siteAlerts = () => {
    return query({
        contentTypes: [`${app.name}:alert`],
        query: `language = '${getContent().language}'`,
        filters: {
            notExists: {
                field: 'data.municipalCodes'
            }
        }
    })
}

export const municipalAlerts = (municipalCode) => query({
    query: `data.municipalCodes IN ('${municipalCode}')`,
    contentType: `${app.name}:alert`
})
