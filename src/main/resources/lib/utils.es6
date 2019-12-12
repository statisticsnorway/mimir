const { list : listOperationsAlerts } = __non_webpack_require__( './mimir/operations-alert')
const { list : listMunicipalityAlerts } = __non_webpack_require__( './mimir/municipality-alert')
const { processHtml } = __non_webpack_require__( '/lib/xp/portal')
const numeral = require('numeral')

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
