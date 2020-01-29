
const {
  list: listOperationsAlerts
} = __non_webpack_require__( '/lib/ssb/operations-alert')
const {
  list: listMunicipalityAlerts
} = __non_webpack_require__( '/lib/ssb/municipality-alert')
const {
  processHtml
} = __non_webpack_require__( '/lib/xp/portal')
const numeral = require('numeral')
const {
  render
} = __non_webpack_require__( '/lib/thymeleaf')
const errorView = resolve('../error/error.html')


exports.createHumanReadableFormat = (value) => {
  return value > 999 ? numeral(value).format('0,0').replace( /,/, '\u00a0' ) : value.toString().replace(/\./, ',')
}

export const alertsForContext = (municipality) => {
  const currentMunicipalityAlerts = municipality ? listMunicipalityAlerts( municipality.code ) : {
    hits: []
  }
  const alerts = [...listOperationsAlerts().hits, ...currentMunicipalityAlerts.hits]
  return alerts.map( (alert) => ({
    title: alert.displayName,
    messageType: alert.type === `${app.name}:operations-alert` ? 'warning' : 'info',
    municipalCodes: alert.data.municipalCodes,
    message: processHtml({
      value: alert.data.message
    })
  }))
}

// Returns page mode for Kommunefakta page based on request mode or request path
export const pageMode = (req, page) => {
  if (req.mode === 'edit') {
    return 'edit'
  }
  return page._path.endsWith(req.path.split('/').pop()) ? 'map' : 'municipality'
}


export function safeRender(view, model) {
  let response
  try {
    response = {
      body: render(view, model),
      status: 200,
      contentType: 'text/html'
    }
  } catch (e) {
    const errorModel = {
      errorTitle: 'Noe gikk galt',
      errorBody: e
    }
    response = {
      body: render(errorView, errorModel),
      status: 400,
      contentType: 'text/html'
    }
  }

  return response
}
