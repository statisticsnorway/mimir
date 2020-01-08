const { getChildren } = __non_webpack_require__( '/lib/xp/content')
const { getDataSetWithDataQueryId, getValueWithIndex, getTime, getDataSetFromDataQuery } = __non_webpack_require__( '../ssb/dataset')
const { get: getKlass } = __non_webpack_require__( './klass')
const { localizeTimePeriod } = __non_webpack_require__( '../language')
const { localize } = __non_webpack_require__( '/lib/xp/i18n')
const { createHumanReadableFormat } = __non_webpack_require__( '../ssb/utils')
const { get: getDataquery } = __non_webpack_require__( '/lib/ssb/dataquery')
const { getSiteConfig } = __non_webpack_require__( '/lib/xp/portal')
const { list: countyList } = __non_webpack_require__( './counties')
const { newCache } = __non_webpack_require__( '/lib/cache')


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


function getMunicipalsFromContent () {
  const key = getSiteConfig().municipalDataContentId
  const children = getChildren({ key }).hits
  if (children.length > 0) {
    const content = key ? children[0] : { data: {} }
    return content.data.json ? JSON.parse(content.data.json).codes : []
  }
  return []
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
 * Parse municipality, from a municipality dataset, data into this format:
 * {
 *   value: int,
 *   time: string,
 *   valueHumanReadable: String
 * }
 * @param {string} dataQueryId
 * @param {object} municipality
 * @param {string} defaultMunicipalityCode
 * @return {object} Parsed object
 */
export const parseMunicipalityValues = (dataQueryId, municipality, defaultMunicipalityCode) => {
  const datasetContent = getDataSetWithDataQueryId(dataQueryId)
  const data = datasetContent.count ? JSON.parse(datasetContent.hits[0].data.json) : getDataSetFromDataQuery( getDataquery({ key: dataQueryId }))
  const value = getValueWithIndex(data.dataset, municipality.code || defaultMunicipalityCode)
  const time = getTime(data.dataset)

  return municipalityObject(value, time)
}

/**
 *
 * @param {String} value
 * @param {String} time
 * @return {{valueNotFound: String, valueHumanReadable: (String), time: String, value: (Number|null)}}
 */
const municipalityObject = (value, time) => ({
  value: notFoundValues.indexOf(value) < 0 ? value : null,
  valueNotFound: localize({ key: 'value.notFound' }),
  time: localizeTimePeriod(time),
  valueHumanReadable: value ? createHumanReadableFormat(value) : undefined
})

const notFoundValues = ['.', '..', '...', ':', '-']

const cache = newCache({ size: 100, expire: 3600 })

export const municipalsWithCounties = () => {
  const counties = countyList()
  const municipalities = list()
  // Caching this since it is a bit heavy
  return cache.get('parsedMunicipality', () => municipalities.map( (municipality) => {
    const getTwoFirstDigits = /^(\d\d).*$/
    const currentCounty = counties.filter( (county) => county.code === municipality.code.replace(getTwoFirstDigits, '$1'))[0]
    const numMunicipalsWithSameName = municipalities.filter( (mun) => mun.name === municipality.name).length

    return {
      code: municipality.code,
      displayName: numMunicipalsWithSameName === 1 ? municipality.name : `${municipality.name} i ${currentCounty.name}`,
      county: {
        name: currentCounty.name
      },
      path: numMunicipalsWithSameName === 1 ? createPath(municipality.name) : createPath(municipality.name, currentCounty.name)
    }
  }))
}

export const getMunicipality = (req) => {
  const municipalities = municipalsWithCounties()

  if (req.path) {
    const municipalityName = req.path.replace(/^.*\//, '/').toLowerCase()
    return municipalities.filter( (municipality) => municipality.path === municipalityName)[0]
  } else if (req.code) {
    return municipalities.filter( (municipality) => municipality.code === req.code )[0]
  } else {
    return undefined
  }
}
