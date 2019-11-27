import { query } from '/lib/xp/content'
import { getContent, processHtml } from '/lib/xp/portal'

export const alertsForContext = (municipality) => {
  const currentMunicipalityAlerts = municipality ? municipalAlerts( municipality.code ) : {hits: []}
  const alerts = [...siteAlerts().hits, ...currentMunicipalityAlerts.hits]
  return alerts.map( (alert) => ({
    title: alert.displayName,
    messageType: alert.data.messageType,
    municipalCodes: alert.data.municipalCodes,
    message: processHtml({value: alert.data.message})
  }))
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
