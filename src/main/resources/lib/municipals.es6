const { getSiteConfig } = require('/lib/xp/portal')
const { request } = require('/lib/http-client')


export const list = () => importMunicipals()

export const query = (queryString) => importMunicipals()
    .filter( (municipal) => RegExp(queryString).test(`${municipal.code} ${municipal.name.toLowerCase()}` ))

function importMunicipals() {
    const municipalUrlAtSSBApi = getSiteConfig().municipality;
    const result = request({
        url: municipalUrlAtSSBApi,
        method: 'GET',
        headers: {
            'Cache-Control': 'no-cache',
            'Accept': 'application/json'
        },
        connectionTimeout: 20000,
        readTimeout: 5000
    })
    return result.status === 200 ? JSON.parse(result.body).codes : []
}
