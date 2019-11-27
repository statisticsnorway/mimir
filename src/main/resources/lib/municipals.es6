const { getSiteConfig } = require('/lib/xp/portal')
const { request } = require('/lib/http-client')
const { newCache } = require('/lib/cache');

const cache = newCache({size: 100, expire: 1000})

export const list = () => importMunicipals()

export const query = (queryString) => importMunicipals()
    .filter( (municipal) => RegExp(queryString).test(`${municipal.code} ${municipal.name.toLowerCase()}` ))

function importMunicipals() {
    const municipalUrlAtSSBApi = getSiteConfig().municipality;
    return cache.get('municipalsFromAPI', () => {
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
    })
}

// Returns page mode for Kommunefakta page based on request mode or request path
export const mode = function(req, page) {
  return req.mode === 'edit' && 'edit' || page._path.endsWith(req.path.split('/').pop()) ? 'map' : 'municipality'
}
