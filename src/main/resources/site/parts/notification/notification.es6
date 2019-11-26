import { getSiteNotifications, getMunicipalNotifications } from '/lib/mimir/notification'
import { getMunicipality } from '/lib/klass'
import { render } from '/lib/thymeleaf'

const view = resolve('notification.html')

exports.get = (req) => {
    const siteNotifications = getSiteNotifications();
    const municipality = getMunicipality(req)
    const municipalityNotification = municipality ? getMunicipalNotifications( municipality.code ) : {hits: []}

    const body = createView([...siteNotifications.hits, ...municipalityNotification.hits])
    return { body }
}

const createView = (warnings) => {
    const params = {
        warnings: warnings.map( (warning) => ({...warning.data, title: warning.displayName}))
    }
    return warnings.length ? render(view, params) : ''
}
