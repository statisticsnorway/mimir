import { getDataSetWithDataQueryId } from './mimir/dataset'
import { datasetToMunicipalityWithValues, get as getKlass } from './klass'
import { localizeTimePeriod } from './language'
import { createHumanReadableFormat } from './utils'
import { get as getDataquery } from '/lib/mimir/dataquery'
import { getSiteConfig } from '/lib/xp/portal'
import { request } from '/lib/http-client'
import { newCache } from '/lib/cache'

const cache = newCache({size: 100, expire: 1000})

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

/**
 * Gets a dataset with values from statistikkbanken
 * @param {string} url
 * @param {string} query
 * @param {string} municipalityCode
 * @return {object} dataset with values from statistikkbanken
 */
export const getValue = (url, query, municipalityCode) => {
    const selection = { filter: 'item', values: municipalityCode }
    return getKlass(url, query, selection)
}


/**
 *
 * @param {string} dataQueryId
 * @param {object} municipality
 * @return {object} An object with the properties: { value, time valueHumanReadable}, from a municipality dataset
 */
export const parseMunicipalityValues = (dataQueryId, municipality) => {
    const dataqueryContent = getDataquery({key: dataQueryId}) // hent key-figure sin dataquery
    const dataset = getDataSetWithDataQueryId(dataQueryId)

    if (dataset && dataset.count) {
        // Use saved dataset
        const data = JSON.parse(dataset.hits[0].data.json)
        const table = datasetToMunicipalityWithValues(data.dataset)
        const time = data && Object.keys(data.dataset.dimension.Tid.category.index)[0]
        const value = (table[municipality && municipality.code || keyFigure.data.default] || { value: '-'}).value
        return {
            value: value,
            time: localizeTimePeriod(time),
            valueHumanReadable: value ? createHumanReadableFormat(value): undefined
        }
    }
    else { // Use direct lookup with http through /lib/dataquery (wrapper for http-client)
        const selection = { filter: 'item', values: [municipality && municipality.code || keyFigure.data.default] }
        const result = getKlass(dataqueryContent.data.table, JSON.parse(dataqueryContent.data.json), selection)
        const time = result && Object.keys(result.dataset.dimension.Tid.category.index)[0]
        return {
            value: result.dataset.value[0],
            time: localizeTimePeriod(time),
            valueHumanReadable: result.dataset.value[0] ? createHumanReadableFormat(result.dataset.value[0]): undefined
        }
    }
}
