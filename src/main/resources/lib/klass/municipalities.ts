import { SiteConfig } from '../../site/site-config'
import { ContentLibrary, Content, QueryResponse } from 'enonic-types/lib/content'
import { Dataset } from '../../site/content-types/dataset/dataset'
import { Request } from 'enonic-types/lib/controller'
import { CacheLib, Cache } from '../types/cache'
import { HttpResponse } from 'enonic-types/lib/http'
import { PortalLibrary } from 'enonic-types/lib/portal'
import { County, CountiesLib } from './counties'

const {
  getChildren
}: ContentLibrary = __non_webpack_require__( '/lib/xp/content')
const {
  getDataSetWithDataQueryId, getValueWithIndex, getTime, getDataSetFromDataQuery
} = __non_webpack_require__( '../ssb/dataset')
const {
  get: getKlass
} = __non_webpack_require__( './klass')
const {
  localizeTimePeriod
} = __non_webpack_require__( '../language')
const {
  localize
} = __non_webpack_require__( '/lib/xp/i18n')
const {
  createHumanReadableFormat
} = __non_webpack_require__( '../ssb/utils')
const {
  get: getDataquery
} = __non_webpack_require__( '/lib/ssb/dataquery')
const {
  getSiteConfig
}: PortalLibrary = __non_webpack_require__( '/lib/xp/portal')
const {
  list: countyList
}: CountiesLib = __non_webpack_require__( './counties')
const {
  newCache
}: CacheLib = __non_webpack_require__( '/lib/cache')
const {
  request: httpRequest
} = __non_webpack_require__( '/lib/http-client')

/**
 * @return {array} Returns everything in the "code" node from ssb api
 */
export const list: () => Array<MunicipalCode> = () => getMunicipalsFromContent()

/**
 *
 * @param {string} queryString
 * @return {array} a set of municipals containing the querystring in municiaplity code or name
 */
export const query: (queryString: string) => Array<MunicipalCode> = (queryString) => getMunicipalsFromContent()
  .filter( (municipal) => RegExp(queryString.toLowerCase()).test(`${municipal.code} ${municipal.name.toLowerCase()}` ))


function getMunicipalsFromContent(): Array<MunicipalCode> {
  const siteConfig: SiteConfig = getSiteConfig()
  const key: string | undefined = siteConfig.municipalDataContentId
  if (key) {
    const children: Array<Content<Dataset>> = getChildren({
      key
    }).hits as Array<Content<Dataset>>
    if (children.length > 0) {
      const content: Content<Dataset> = children[0]
      if (content.data.json) {
        return JSON.parse(content.data.json).codes as Array<MunicipalCode>
      }
    }
  }
  return []
}

/**
 *
 * @param {string} municipalName required
 * @param {string} countyName optional, if set it will be added to the path
 * @return {string} create valid municipal path
 */
export function createPath(municipalName: string, countyName?: string): string {
  const path: string = countyName !== undefined ? `/${municipalName}-${countyName}` : `/${municipalName}`
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
export function getValue(url: string, query: string, municipalityCode: string): object {
  // change from object type to interface in klass lib
  const selection: object = {
    filter: 'item',
    values: municipalityCode
  }
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
export function parseMunicipalityValues(dataQueryId: string, municipality: MunicipalityWithCounty, defaultMunicipalityCode: string): Municipality {
  const datasetContent: QueryResponse<Dataset> = getDataSetWithDataQueryId(dataQueryId)
  let data: DatasetJSONData
  if (datasetContent.count) {
    data = JSON.parse(datasetContent.hits[0].data.json)
  } else {
    data = getDataSetFromDataQuery( getDataquery({
      key: dataQueryId
    }))
  }
  const value: string = getValueWithIndex(data.dataset, municipality.code || defaultMunicipalityCode)
  const time: string = getTime(data.dataset)

  return municipalityObject(value, time)
}


/**
 *
 * @param {String} value
 * @param {String} time
 * @return {Municipality}
 */
const notFoundValues: Array<string> = ['.', '..', '...', ':', '-']
function municipalityObject(value: string, time: string): Municipality {
  return {
    value: notFoundValues.indexOf(value) < 0 ? value : null,
    valueNotFound: localize({
      key: 'value.notFound'
    }),
    time: localizeTimePeriod(time),
    valueHumanReadable: value ? createHumanReadableFormat(value) : undefined
  }
}


const cache: Cache = newCache({
  size: 1000,
  expire: 3600
})

export function municipalsWithCounties(): Array<MunicipalityWithCounty> {
  const counties: Array<County> = countyList()
  const municipalities: Array<MunicipalCode> = list()
  // Caching this since it is a bit heavy
  return cache.get('parsedMunicipality', () => municipalities.map( (municipality: MunicipalCode) => {
    const getTwoFirstDigits: RegExp = /^(\d\d).*$/
    const currentCounty: County = counties.filter((county: County) => county.code === municipality.code.replace(getTwoFirstDigits, '$1'))[0]
    const numMunicipalsWithSameName: number = municipalities.filter( (mun) => mun.name === municipality.name).length

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

export function getMunicipality(req: RequestWithCode): MunicipalityWithCounty|undefined {
  const municipalities: Array<MunicipalityWithCounty> = municipalsWithCounties()

  let municipality: MunicipalityWithCounty | undefined
  if (req.path) {
    const municipalityName: string = req.path.replace(/^.*\//, '').toLowerCase()
    municipality = getMunicipalityByName(municipalities, municipalityName)
  } else if (req.code) {
    municipality = getMunicipalityByCode(municipalities, req.code)
  }

  if (!municipality && (req.mode === 'edit' || req.mode === 'preview' || req.mode === 'inline')) {
    const siteConfig: SiteConfig = getSiteConfig()
    const defaultMunicipality: string = siteConfig.defaultMunicipality
    municipality = getMunicipalityByCode(municipalities, defaultMunicipality)
  }

  return municipality
}

/**
 *
 * @param {array} municipalities
 * @param {number} municipalityCode
 * @return {*}
 */
function getMunicipalityByCode(municipalities: Array<MunicipalityWithCounty>, municipalityCode: string): MunicipalityWithCounty|undefined {
  return cache.get(`municipality_${municipalityCode}`, () => {
    const changes: Array<MunicipalityChange> | undefined = changesWithMunicipalityCode(municipalityCode)
    const municipality: Array<MunicipalityWithCounty> = municipalities.filter((municipality) => municipality.code === municipalityCode)
    return municipality.length > 0 ? {
      ...municipality[0],
      changes
    } : undefined
  })
}


/**
 *
 * @param {array} municipalities
 * @param {string} municipalityName
 * @return {*}
 */
function getMunicipalityByName(municipalities: Array<MunicipalityWithCounty>, municipalityName: string): MunicipalityWithCounty|undefined {
  return cache.get(`municipality_${municipalityName}`, () => {
    const changes: Array<MunicipalityChange> | undefined = changesWithMunicipalityName(municipalityName)
    const municipality: Array<MunicipalityWithCounty> = municipalities.filter((municipality) => municipality.path === `/${municipalityName}`)
    return municipality.length > 0 ? {
      ...municipality[0],
      changes
    } : undefined
  })
}


function changesWithMunicipalityName(municipalityName: string): Array<MunicipalityChange>|undefined {
  const changeList: Array<MunicipalityChange> = getMunicipalityChanges().codeChanges
  const changes: Array<MunicipalityChange> = changeList.filter( (change) => {
    return [change.oldName.toLowerCase(), change.newName.toLowerCase()].indexOf(municipalityName) >= 0 &&
        change.oldCode !== change.newCode
  })
  return changes.length ? changes : undefined
}

function changesWithMunicipalityCode(municipalityCode: string): Array<MunicipalityChange>|undefined {
  const changeList: Array<MunicipalityChange> = getMunicipalityChanges().codeChanges
  const changes: Array<MunicipalityChange> = changeList.filter( (change) => {
    return (change.oldCode === municipalityCode || change.newCode === municipalityCode) &&
        change.oldName === change.newName
  })
  return changes.length ? changes : undefined
}


function getMunicipalityChanges(from?: string, to?: string): MunicipalityChangeList {
  if (!from) from = '2016-01-01'
  if (!to) to = '2020-01-01'
  const baseUrl: string = 'https://data.ssb.no/api/klass/v1/'
  const readTimeout: number = 5000
  const connectionTimeout: number = 20000
  const headers: Record<string, any> = {
    'Cache-Control': 'no-cache',
    'Accept': 'application/json'
  }
  const contentType: string = 'application/json'

  const url: string = `classifications/131/changes?from=${from}&to=${to}`
  const result: HttpResponse = cache.get( 'municipalityChanges', () => {
    return httpRequest({
      url: `${baseUrl}${url}`,
      method: 'GET',
      headers,
      connectionTimeout,
      readTimeout,
      contentType
    })
  })
  const body: string = result.body || ''
  return JSON.parse(body)
}

export interface MunicipalityChangeList {
  codeChanges: Array<MunicipalityChange>;
}

export interface MunicipalityChange {
  oldCode: string;
  oldName: string;
  oldShortName?: string;
  newCode: string;
  newName: string;
  newShortName?: string;
  changeOccurred: string;
}

export interface MunicipalitiesLib {
  list: () => Array<MunicipalCode>;
  query: (queryString: string) => Array<MunicipalCode>;
  createPath (municipalName: string, countyName?: string): string;
  getValue (url: string, query: string, municipalityCode: string): object;
  parseMunicipalityValues (dataQueryId: string, municipality: MunicipalityWithCounty, defaultMunicipalityCode: string): Municipality;
  municipalsWithCounties (): Array<MunicipalityWithCounty>;
  getMunicipality (req: Request): MunicipalityWithCounty|undefined;
}

interface RequestWithCode extends Request {
  code: string;
}

export interface MunicipalCode {
  code: string;
  parentCode: string;
  level: string;
  name: string;
  shortName: string;
  presentationName: string;
}

export interface MunicipalityWithCounty {
  code: string;
  displayName: string;
  county: {
    name: string;
  };
  path: string;
  changes?: Array<MunicipalityChange>;
}

export interface Municipality {
  value: string | null;
  valueNotFound: string;
  time: string;
  valueHumanReadable: string;
}

// NOTE extend as needed
export interface DatasetJSONData {
  dataset: {
    status: object;
    dimension: object;
    label: string;
    source: string;
    updated: string;
    value: Array<number>;
  };
}
