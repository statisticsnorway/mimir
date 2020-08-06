/* eslint-disable new-cap */
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import JSONstat from 'jsonstat-toolkit/import.mjs'
import { ContentLibrary, QueryResponse, Content } from 'enonic-types/lib/content'
import { PortalLibrary } from 'enonic-types/lib/portal'
import { KeyFigure } from '../../site/content-types/keyFigure/keyFigure'
import { Dataset } from '../../site/content-types/dataset/dataset'
import { Dataquery } from '../../site/content-types/dataquery/dataquery'
import { MunicipalityWithCounty } from '../klass/municipalities'
import { TbmlData, TableRow, PreliminaryData } from '../types/xmlParser'
import { Dataset as JSDataset, Dimension, Category } from '../types/jsonstat-toolkit'
import { UtilLibrary } from '../types/util'
import { DatasetCache, SSBCacheLibrary } from './cache'
import { Request } from 'enonic-types/lib/controller'
import { DatasetRepoNode } from '../repo/dataset'
import { DataSource as DataSourceType } from '../repo/dataset'
const {
  query
}: ContentLibrary = __non_webpack_require__( '/lib/xp/content')
const {
  imageUrl
}: PortalLibrary = __non_webpack_require__( '/lib/xp/portal')
const {
  get: getDataquery
} = __non_webpack_require__( '/lib/ssb/dataquery')
const {
  getDataSetWithDataQueryId
} = __non_webpack_require__( '/lib/ssb/dataset')
const {
  localizeTimePeriod
} = __non_webpack_require__( '/lib/language')
const {
  localize
} = __non_webpack_require__( '/lib/xp/i18n')
const {
  createHumanReadableFormat,
  getImageCaption
} = __non_webpack_require__( '/lib/ssb/utils')
const {
  fromDatasetCache
}: SSBCacheLibrary = __non_webpack_require__( '/lib/ssb/cache')
const util: UtilLibrary = __non_webpack_require__( '/lib/util')
const {
  getDataset
} = __non_webpack_require__( '/lib/ssb/dataset/dataset')

const contentTypeName: string = `${app.name}:keyFigure`

export function get(keys: string | Array<string>): Array<Content<KeyFigure>> {
  keys = util.data.forceArray(keys) as Array<string>
  const content: QueryResponse<KeyFigure> = query({
    contentTypes: [contentTypeName],
    query: ``,
    count: keys.length,
    start: 0,
    filters: {
      ids: {
        values: keys
      }
    }
  })
  const hits: Array<Content<KeyFigure>> = keys.reduce((keyfigures: Array<Content<KeyFigure>>, id: string) => {
    const found: Array<Content<KeyFigure>> = content.hits.filter((keyFigure) => keyFigure._id === id)
    if (found.length === 1) {
      keyfigures.push(found[0])
    }
    return keyfigures
  }, [])
  return hits
}

type JsonStatFormat = Dataquery['datasetFormat']['jsonStat'];
type DatasetOption = NonNullable<JsonStatFormat>['datasetFilterOptions']

export function parseKeyFigure(req: Request, keyFigure: Content<KeyFigure>, municipality?: MunicipalityWithCounty): KeyFigureView {
  const keyFigureViewData: KeyFigureView = {
    iconUrl: getIconUrl(keyFigure),
    iconAltText: keyFigure.data.icon ? getImageCaption(keyFigure.data.icon) : '',
    number: undefined,
    numberDescription: keyFigure.data.denomination,
    noNumberText: localize({
      key: 'value.notFound'
    }),
    time: undefined,
    size: keyFigure.data.size,
    title: keyFigure.displayName,
    changes: undefined,
    greenBox: keyFigure.data.greenBox,
    glossaryText: keyFigure.data.glossaryText
  }

  const dataQueryId: string | undefined = keyFigure.data.dataquery
  const datasetRepo: DatasetRepoNode<JSONstat> | null = getDataset(keyFigure)

  if (datasetRepo) {
    const dataSource: KeyFigure['dataSource'] | undefined = keyFigure.data.dataSource
    let data: JSDataset | Array<JSDataset> | null | TbmlData = datasetRepo.data

    if (dataSource && dataSource._selected === DataSourceType.STATBANK_API) {
      data = JSONstat(data).Dataset(0)
      const ds: JSDataset | Array<JSDataset> | null = data as JSDataset | Array<JSDataset> | null
      const xAxisLabel: string | undefined = dataSource.statbankApi ? dataSource.statbankApi.xAxisLabel : undefined
      const yAxisLabel: string | undefined = dataSource.statbankApi ? dataSource.statbankApi.yAxisLabel : undefined

      // if filter get data with filter
      if (dataSource.statbankApi && dataSource.statbankApi.datasetFilterOptions && dataSource.statbankApi.datasetFilterOptions._selected) {
        const filterOptions: DatasetOption = dataSource.statbankApi.datasetFilterOptions
        getDataWithFilterStatbankApi(keyFigureViewData, municipality, filterOptions, ds, xAxisLabel, yAxisLabel)
      } else if (xAxisLabel && ds && !(ds instanceof Array)) {
        // get all data without filter
      }
    } else if (dataSource && dataSource._selected === DataSourceType.TBPROCESSOR) {
      getDataTbProcessor(keyFigureViewData, data, keyFigure)
    }
    return keyFigureViewData
  }

  // TODO: Fjerne koden nedenfor når vi har fjernet dataQuery fra innholdstypen Keyfigures

  if (dataQueryId && !datasetRepo) {
    const cachedQuery: DatasetCache = fromDatasetCache(req, dataQueryId, () => {
      const dataQueryContent: Content<Dataquery> = getDataquery({
        key: dataQueryId
      })
      const datasetContent: Content<Dataset> = getDataSetWithDataQueryId(dataQueryId).hits[0]
      let parsedData: JSDataset | Array<JSDataset> | null | TbmlData | TbmlData = JSON.parse(datasetContent.data.json)
      if (dataQueryContent.data.datasetFormat._selected === 'jsonStat') {
        parsedData = JSONstat(parsedData).Dataset(0)
      }
      return {
        data: parsedData,
        format: dataQueryContent.data.datasetFormat
      }
    })
    const data: JSDataset | Array<JSDataset> | null | TbmlData = cachedQuery.data
    const datasetFormat: Dataquery['datasetFormat'] = cachedQuery.format

    if (datasetFormat._selected === 'jsonStat') {
      // prepare jsonstat
      const ds: JSDataset | Array<JSDataset> | null = data as JSDataset | Array<JSDataset> | null
      const jsonStatConfig: JsonStatFormat | undefined = datasetFormat[datasetFormat._selected]
      const xAxisLabel: string | undefined = jsonStatConfig ? jsonStatConfig.xAxisLabel : undefined
      const yAxisLabel: string | undefined = jsonStatConfig ? jsonStatConfig.yAxisLabel : undefined

      // if filter get data with filter
      if (jsonStatConfig && jsonStatConfig.datasetFilterOptions && jsonStatConfig.datasetFilterOptions._selected) {
        const filterOptions: DatasetOption = jsonStatConfig.datasetFilterOptions
        getDataWithFilterStatbankApi(keyFigureViewData, municipality, filterOptions, ds, xAxisLabel, yAxisLabel)
      } else if (xAxisLabel && ds && !(ds instanceof Array)) {
      // get all data without filter
      }
    } else if (datasetFormat._selected === 'tbml') {
      getDataTbProcessor(keyFigureViewData, data, keyFigure)
    }
  }
  return keyFigureViewData
}

function getDataTbProcessor(
  keyFigureViewData: KeyFigureView,
  data: JSDataset | Array<JSDataset> | null | TbmlData,
  keyFigure: Content<KeyFigure>
): KeyFigureView {
  const tbmlData: TbmlData = data as TbmlData
  const bodyRows: Array<TableRow> = util.data.forceArray(tbmlData.tbml.presentation.table.tbody.tr) as Array<TableRow>
  const head: TableRow = tbmlData.tbml.presentation.table.thead.tr
  const [row1, row2] = bodyRows

  if (row1) {
    let value: number
    const td: number | PreliminaryData = util.data.forceArray(row1.td)[0] as number | PreliminaryData
    if (typeof td === 'object' && td.content != undefined) {
      value = td.content
    } else {
      value = td as number
    }
    keyFigureViewData.number = parseValue(value)
  }
  if (row2 && keyFigure.data.changes) {
    let change: number
    const td: number | PreliminaryData = util.data.forceArray(row2.td)[0] as number | PreliminaryData
    if (typeof td === 'object' && td.content != undefined) {
      change = td.content
    } else {
      change = td as number
    }
    let changeText: undefined | string = parseValue(change)
    // add denomination if there is any change
    if (changeText && keyFigure.data.changes) {
      const denomination: string | undefined = (keyFigure.data.changes as { denomination?: string }).denomination
      if (denomination) {
        changeText += ` ${denomination}`
      }
    }
    // set arrow direction based on change
    let changeDirection: KeyFigureChanges['changeDirection'] = 'same'
    if (change > 0) {
      changeDirection = 'up'
    } else if (change < 0) {
      changeDirection = 'down'
    } else {
      changeText = localize({
        key: 'keyFigure.noChange'
      })
    }
    keyFigureViewData.changes = {
      changeDirection,
      changeText,
      changePeriod: row2.th.toString()
    }
  }
  keyFigureViewData.time = (util.data.forceArray(head.th)[0] as number | string).toString()

  return keyFigureViewData
}

function getDataWithFilterStatbankApi(
  keyFigureViewData: KeyFigureView,
  municipality: MunicipalityWithCounty | undefined,
  filterOptions: DatasetOption,
  ds: JSDataset | Array<JSDataset>| null,
  xAxisLabel: string | undefined,
  yAxisLabel: string | undefined
): KeyFigureView {
  if (yAxisLabel && ds && !(ds instanceof Array)) {
    if (filterOptions && filterOptions.municipalityFilter && filterOptions._selected === 'municipalityFilter' && municipality) {
      const filterTarget: string = filterOptions.municipalityFilter.municipalityDimension
      // get value and label from json-stat data, filtering on municipality
      let municipalData: MunicipalData | null = getDataFromMunicipalityCode(ds, municipality.code, yAxisLabel, filterTarget)
      // not all municipals have data, so if its missing, try the old one
      if ((!municipalData || (municipalData.value === null || municipalData.value === 0)) && municipality.changes && municipality.changes.length > 0) {
        municipalData = getDataFromMunicipalityCode(ds, municipality.changes[0].oldCode, yAxisLabel, filterTarget)
      }
      if (municipalData && municipalData.value !== null) {
        // add data to key figure view
        keyFigureViewData.number = parseValue(municipalData.value)
        keyFigureViewData.time = localizeTimePeriod(municipalData.label)
      }
    }
  }

  return keyFigureViewData
}

function getIconUrl(keyFigure: Content<KeyFigure>): string {
  let iconUrl: string = ''
  if (keyFigure.data.icon) {
    iconUrl = imageUrl({
      id: keyFigure.data.icon,
      scale: 'block(100,100)'
    })
  }
  return iconUrl
}

function getDataFromMunicipalityCode(ds: JSDataset, municipalityCode: string, yAxisLabel: string, filterTarget: string): MunicipalData | null {
  const filterTargetIndex: number = ds.id.indexOf(filterTarget)
  const filterDimension: Dimension | null = ds.Dimension(filterTarget) as Dimension | null
  if ( !filterDimension ) {
    return null
  }
  const filterCategory: Category | null = filterDimension.Category(municipalityCode) as Category | null
  const filterCategoryIndex: number | undefined = filterCategory ? filterCategory.index : undefined
  const dimensionFilter: Array<number|string> = ds.id.map( () => 0 )

  if (filterCategoryIndex !== undefined && filterCategoryIndex >= 0) {
    dimensionFilter[filterTargetIndex] = filterCategoryIndex
  } else {
    return null
  }

  const yAxisIndex: number = ds.id.indexOf(yAxisLabel)
  const yDimension: Dimension | Array<Dimension> | null = ds.Dimension(yAxisLabel)
  const yCategories: Category | Array<Category> | null = yDimension && !(yDimension instanceof Array) ? yDimension.Category() : null
  if (yCategories && Array.isArray(yCategories) && yCategories.length > 0) {
    const yCategory: Category | undefined = yCategories.shift()
    if (yCategory) {
      dimensionFilter[yAxisIndex] = yCategory.index
      const d: number | null = ds.Data(dimensionFilter, false) as number | null
      return {
        value: d,
        label: yCategory.label
      }
    }
  }
  return null
}

const notFoundValues: Array<string> = ['.', '..', '...', ':', '-']
function parseValue(value: number | string | null): string | undefined {
  let hasValue: boolean = true
  if (!value || notFoundValues.indexOf(value.toString()) > -1) {
    hasValue = false
  }
  return hasValue ? createHumanReadableFormat(value) : undefined
}

interface MunicipalData {
  value: number | null;
  label?: string;
}

export interface KeyFigureView {
  iconUrl?: string;
  iconAltText?: string;
  number?: string;
  numberDescription?: string;
  noNumberText: string;
  size?: string;
  title: string;
  time?: string;
  changes?: KeyFigureChanges;
  greenBox: boolean;
  glossaryText?: string;
}

export interface KeyFigureChanges {
  changeDirection: 'up' | 'down' | 'same';
  changeText?: string;
  changePeriod: string;
}
