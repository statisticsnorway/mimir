import { getChildren } from '/lib/xp/content'
import { getDataSetWithDataQueryId } from './mimir/dataset'
import { datasetToMunicipalityWithValues, get as getKlass } from './klass'
import { localizeTimePeriod } from './language'
import { createHumanReadableFormat } from './utils'
import { get as getDataquery } from '/lib/mimir/dataquery'
import { getSiteConfig } from '/lib/xp/portal'

/**
 * @return {array} Returns everything in the "code" node from ssb api
 */
export const list = () => getMunicipalsFromContent()

/**
 *
 * @param {string} queryString
 * @return {array} a set of municipals containing the querystring in municiaplity code or name
 */
export const query = (queryString) => getMunicipalsFromContent()
  .filter( (municipal) => RegExp(queryString.toLowerCase()).test(`${municipal.code} ${municipal.name.toLowerCase()}` ))

function getMunicipalsFromContent() {
  const key = getSiteConfig().municipalDataContentId
  const content = key ? getChildren({key}).hits[0] : {data: {}}
  return content.data.json ? JSON.parse(content.data.json).codes : []
}

/**
 *
 * @param {string} municipalName required
 * @param {string} countyName optional, if set it will be added to the path
 * @return {string} create valid municipal path
 */
export const createPath = (municipalName, countyName = undefined) => {
  const path = countyName !== undefined ? `/${municipalName}-${countyName}` : `/${municipalName}`
  return path.replace(/ /g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
    .replace(/å/g, 'a')
    .replace(/æ/g, 'ae')
    .replace(/á/g, 'a')
    .replace(/ø/g, 'o')
}

// Returns page mode for Kommunefakta page based on request mode or request path
export const mode = function(req, page) {
  return req.mode === 'edit' && 'edit' || page._path.endsWith(req.path.split('/').pop()) ? 'map' : 'municipality'
}

/**
 * Get a dataset with values from statistikkbanken
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
 * @return {object} An object with the properties: { value: int, time: string, valueHumanReadable: String}, from a municipality dataset
 */
export const parseMunicipalityValues = (dataQueryId, municipality) => {
  const dataqueryContent = getDataquery({key: dataQueryId}) // hent key-figure sin dataquery
  const dataset = getDataSetWithDataQueryId(dataQueryId)

  if (dataset && dataset.count) {
    // Use saved dataset
    const data = JSON.parse(dataset.hits[0].data.json)
    const table = datasetToMunicipalityWithValues(data.dataset)
    const time = data && Object.keys(data.dataset.dimension.Tid.category.index)[0]
    const value = (table[municipality && municipality.code || keyFigure.data.default] || { value: '-'}).value
    return {
      value: value,
      time: localizeTimePeriod(time),
      valueHumanReadable: value ? createHumanReadableFormat(value): undefined
    }
  } else { // Use direct lookup with http through /lib/dataquery (wrapper for http-client)
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
