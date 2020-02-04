/* eslint-disable new-cap */
import { SiteConfig } from '../../site/site-config'
import { ContentLibrary, Content, QueryResponse } from 'enonic-types/lib/content'
import { Dataset } from '../../site/content-types/dataset/dataset'
import { Request } from 'enonic-types/lib/controller'
import { CacheLib, Cache } from '../types/cache'
import { PortalLibrary } from 'enonic-types/lib/portal'
import { County, CountiesLib } from './counties'
import { Dataquery } from '../../site/content-types/dataquery/dataquery'
import { Dataset as JSDataset,
  Dimension,
  Category } from '../types/jsonstat-toolkit'
import { TbmlData, TableRow } from '../types/xmlParser'

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import JSONstat from 'jsonstat-toolkit/import.mjs'

const {
  getChildren
}: ContentLibrary = __non_webpack_require__( '/lib/xp/content')
const {
  getDataSetWithDataQueryId
} = __non_webpack_require__( '../ssb/dataset')
const {
  get: getKlass
} = __non_webpack_require__( '/lib/klass/klass')
const {
  localizeTimePeriod
} = __non_webpack_require__( '/lib/language')
const {
  localize
} = __non_webpack_require__( '/lib/xp/i18n')
const {
  createHumanReadableFormat
} = __non_webpack_require__( '/lib/ssb/utils')
const {
  get: getDataquery
} = __non_webpack_require__( '/lib/ssb/dataquery')
const {
  getSiteConfig
}: PortalLibrary = __non_webpack_require__( '/lib/xp/portal')
const {
  list: countyList
}: CountiesLib = __non_webpack_require__( '/lib/klass/counties')
const {
  newCache
}: CacheLib = __non_webpack_require__( '/lib/cache')

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


type JsonStatFormat = Dataquery['datasetFormat']['jsonStat'];
type DatasetOption = NonNullable<JsonStatFormat>['datasetFilterOptions']

export function parseMunicipalityValues(dataQueryId: string, municipality: MunicipalityWithCounty): MunicipalityDataFromDataset {
  // get dataset
  const dataQueryContent: Content<Dataquery> = getDataquery({
    key: dataQueryId
  })
  const datasetContent: QueryResponse<Dataset> = getDataSetWithDataQueryId(dataQueryId)
  const datasetFormat: Dataquery['datasetFormat'] = dataQueryContent.data.datasetFormat

  // prepare jsonstat
  const data: DatasetJSONData | TbmlData = JSON.parse(datasetContent.hits[0].data.json)
  let valueToReturn: Array<MunicipalityDataFromDataset> = []

  if (datasetFormat._selected === 'jsonStat') {
    const ds: JSDataset | Array<JSDataset> | null = JSONstat(data).Dataset(0)
    const jsonStatConfig: JsonStatFormat | undefined = datasetFormat[datasetFormat._selected]
    const xAxisLabel: string | undefined = jsonStatConfig ? jsonStatConfig.xAxisLabel : undefined
    const yAxisLabel: string | undefined = jsonStatConfig ? jsonStatConfig.yAxisLabel : undefined

    // if filter get data with filter
    if (jsonStatConfig && jsonStatConfig.datasetFilterOptions && jsonStatConfig.datasetFilterOptions._selected) {
      const filterOptions: DatasetOption = jsonStatConfig.datasetFilterOptions

      if (yAxisLabel && ds && !(ds instanceof Array)) {
        if (filterOptions && filterOptions.municipalityFilter && filterOptions._selected === 'municipalityFilter') {
          const filterTarget: string = filterOptions.municipalityFilter.municipalityDimension
          valueToReturn = getDataFromMunicipalityCode(ds, municipality.code, yAxisLabel, filterTarget)
          if ( (!valueToReturn.length || valueToReturn[0].value === null) && municipality.changes) {
            valueToReturn = getDataFromMunicipalityCode(ds, municipality.changes[0].oldCode, yAxisLabel, filterTarget)
          }
        }
      }
    } else if (xAxisLabel && ds && !(ds instanceof Array)) {
      // get all data without filter
    }
  } else if (datasetFormat._selected === 'tbml') {
    const tbmlData: TbmlData = data as TbmlData
    const bodyRows: Array<TableRow> = tbmlData.tbml.presentation.table.tbody.tr
    const head: TableRow = tbmlData.tbml.presentation.table.thead.tr
    let value: number | null = null
    let label: string = ''
    let changes: KeyFigureChanges | undefined
    const [row1, row2] = bodyRows
    if (row1) {
      if (Array.isArray(row1.td)) {
        value = row1.td[0]
      } else {
        value = row1.td as number
      }
    }
    if (row2) {
      const change: number = (Array.isArray(row2.td) ? row2.td[0] : row2.td) as number
      let direction: KeyFigureChanges['changeDirection'] = 'same'
      if (change > 0) {
        direction = 'up'
      } else if (change < 0) {
        direction = 'down'
      }
      changes = {
        changeDirection: direction,
        changeText: change.toString(),
        changePeriod: row2.th as string
      }
    }
    if (Array.isArray(head.th)) {
      label = head.th[0]
    } else {
      label = head.th as string
    }
    valueToReturn.push(municipalityObject(value, label, false, changes))
  }

  return valueToReturn[0]
}


function getDataFromMunicipalityCode(ds: JSDataset, municipalityCode: string, yAxisLabel: string, filterTarget: string): Array<MunicipalityDataFromDataset> {
  const filterTargetIndex: number = ds.id.indexOf(filterTarget)
  const filterDimension: Dimension | null = ds.Dimension(filterTarget) as Dimension | null
  if ( !filterDimension ) {
    return []
  }
  const filterCategory: Category | null = filterDimension.Category(municipalityCode) as Category | null
  const filterCategoryIndex: number | undefined = filterCategory ? filterCategory.index : undefined
  const dimensionFilter: Array<number|string> = ds.id.map( () => 0 )

  if (filterCategoryIndex !== undefined && filterCategoryIndex >= 0) {
    dimensionFilter[filterTargetIndex] = filterCategoryIndex
  } else {
    return []
  }

  const yAxisIndex: number = ds.id.indexOf(yAxisLabel)
  const yDimension: Dimension | Array<Dimension> | null = ds.Dimension(yAxisLabel)
  const yCategories: Category | Array<Category> | null = yDimension && !(yDimension instanceof Array) ? yDimension.Category() : null
  return yCategories && (yCategories instanceof Array) ?
    yCategories.map( (yCategory: Category) => {
      dimensionFilter[yAxisIndex] = yCategory.index
      const d: number | null = ds.Data(dimensionFilter, false) as number | null
      return municipalityObject(d, yCategory.label, true)
    }) : []
}

/**
 *
 * @param {String} value
 * @param {String} time
 * @return {MunicipalityDataFromDataset}
 */
const notFoundValues: Array<string> = ['.', '..', '...', ':', '-']
function municipalityObject(
  value: number | null,
  label: string,
  localizeNumberDescription: boolean = false,
  changes?: KeyFigureChanges
): MunicipalityDataFromDataset {
  return {
    value: value && notFoundValues.indexOf(value.toString()) < 0 ? value.toString() : null,
    valueNotFound: localize({
      key: 'value.notFound'
    }),
    numberDescription: localizeNumberDescription ? localizeTimePeriod(label) : label,
    valueHumanReadable: value ? createHumanReadableFormat(value) : undefined,
    changes
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
  return changes
}

function changesWithMunicipalityCode(municipalityCode: string): Array<MunicipalityChange>|undefined {
  const changeList: Array<MunicipalityChange> = getMunicipalityChanges().codeChanges
  const changes: Array<MunicipalityChange> = changeList.filter( (change) => {
    return (change.oldCode === municipalityCode || change.newCode === municipalityCode) &&
        change.oldName === change.newName
  })
  return changes
}


function getMunicipalityChanges(): MunicipalityChangeList {
  const changeListId: string | undefined = getSiteConfig<SiteConfig>().municipalChangeListContentId
  const datasetList: QueryResponse<Dataset> = getDataSetWithDataQueryId(changeListId)
  const changeListContent: Content<Dataset> | undefined = datasetList.count > 0 ? datasetList.hits[0] : undefined
  const body: string |undefined = changeListContent ? changeListContent.data.json : undefined
  return body ? JSON.parse(body) : {
    codes: []
  }
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
  parseMunicipalityValues (dataQueryId: string, municipality: MunicipalityWithCounty, defaultMunicipalityCode: string): MunicipalityDataFromDataset;
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

export interface MunicipalityDataFromDataset {
  value: string | null;
  valueNotFound: string;
  numberDescription: string;
  valueHumanReadable: string;
  changes?: KeyFigureChanges;
}

export interface KeyFigureChanges {
  changeDirection: 'up' | 'down' | 'same';
  changeText: string;
  changePeriod: string;
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
