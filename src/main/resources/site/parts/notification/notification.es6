const { getMunicipality } = require( "/lib/klass")
const { query } = require('/lib/xp/content')
const { render } = require('/lib/thymeleaf')

const view = resolve('notification.html')

exports.get = (req) => {
    const municipalityWarnings = getMunicipalWarnings( getMunicipality(req).code )
    const params = {
        warnings: municipalityWarnings.hits.map( (warning) => ({...warning.data, title: warning.displayName}))
    }
    return {
        body: municipalityWarnings.count ? render(view, params) : ''
    }
}

const getMunicipalWarnings = (municipalCode) => query({
    query: `data.municipalCodes IN ('${municipalCode}')`,
    contentType: `${app.name}:notification`
})

