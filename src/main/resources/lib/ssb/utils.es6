import { list as listOperationsAlerts } from '/lib/ssb/operations-alert';
import { list as listMunicipalityAlerts } from '/lib/ssb/municipality-alert'
import { processHtml } from '/lib/xp/portal'

const numeral = require('/lib/numeral')

exports.createHumanReadableFormat = (value) => {
  return value > 999 ? numeral(value).format('0,0').replace(/,/, '&thinsp;') : value.toString().replace(/\./, ',')
}

export const alertsForContext = (municipality) => {
  const currentMunicipalityAlerts = municipality ? listMunicipalityAlerts( municipality.code ) : {hits: []}
  const alerts = [...listOperationsAlerts().hits, ...currentMunicipalityAlerts.hits]
  return alerts.map( (alert) => ({
    title: alert.displayName,
    messageType: alert.type === `${app.name}:operations-alert` ? 'warning' : 'info',
    municipalCodes: alert.data.municipalCodes,
    message: processHtml({value: alert.data.message})
  }))
}

// Returns page mode for Kommunefakta page based on request mode or request path
export const pageMode = (req, page) => {
  return req.mode === 'edit' && 'edit' || page._path.endsWith(req.path.split('/').pop()) ? 'map' : 'municipality'
}
