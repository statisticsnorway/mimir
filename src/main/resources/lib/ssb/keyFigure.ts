__non_webpack_require__('/lib/polyfills/nashorn')
/* eslint-disable new-cap */
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import JSONstat from 'jsonstat-toolkit/import.mjs'
import { ContentLibrary, QueryResponse, Content } from 'enonic-types/content'
import { PortalLibrary } from 'enonic-types/portal'
import { KeyFigure } from '../../site/content-types/keyFigure/keyFigure'
import { MunicipalityWithCounty } from '../klass/municipalities'
import { TbmlData, TableRow, PreliminaryData } from '../types/xmlParser'
import { Dataset as JSDataset, Dimension, Category } from '../types/jsonstat-toolkit'
import { Request } from 'enonic-types/controller'
import { DatasetRepoNode, RepoDatasetLib } from '../repo/dataset'
import { DataSource as DataSourceType } from '../repo/dataset'
import { SSBCacheLibrary } from './cache'
import { Thead } from '../../lib/types/xmlParser'

const {
  query
}: ContentLibrary = __non_webpack_require__( '/lib/xp/content')
const {
  imageUrl
}: PortalLibrary = __non_webpack_require__( '/lib/xp/portal')
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
  datasetOrUndefined
}: SSBCacheLibrary = __non_webpack_require__('/lib/ssb/cache')

const {
  data: {
    forceArray
  }
} = __non_webpack_require__( '/lib/util')

const {
  getDataset
} = __non_webpack_require__( '/lib/ssb/dataset/dataset')
const {
  DATASET_BRANCH,
  UNPUBLISHED_DATASET_BRANCH
}: RepoDatasetLib = __non_webpack_require__('/lib/repo/dataset')

const contentTypeName: string = `${app.name}:keyFigure`

export function get(keys: string | Array<string>): Array<Content<KeyFigure>> {
  keys = forceArray(keys) as Array<string>
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

type KeyFigureDataSource = KeyFigure['dataSource']
type StatBankApi = NonNullable<KeyFigureDataSource>[DataSourceType.STATBANK_API]
type DatasetFilterOptions = NonNullable<StatBankApi>['datasetFilterOptions']

export function parseKeyFigure(
  req: Request,
  keyFigure: Content<KeyFigure>,
  municipality?: MunicipalityWithCounty,
  branch: string = DATASET_BRANCH): KeyFigureView {
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

  let datasetRepo: DatasetRepoNode<JSONstat> | undefined
  if (branch === UNPUBLISHED_DATASET_BRANCH) {
    datasetRepo = getDataset(keyFigure, UNPUBLISHED_DATASET_BRANCH)
  } else {
    datasetRepo = datasetOrUndefined(keyFigure)
  }

  if (datasetRepo) {
    const dataSource: KeyFigure['dataSource'] | undefined = keyFigure.data.dataSource
    const data: JSDataset | Array<JSDataset> | null | TbmlData = datasetRepo.data

    if (dataSource && dataSource._selected === DataSourceType.STATBANK_API) {
      const ds: JSDataset | Array<JSDataset> | null = JSONstat(data).Dataset(0) as JSDataset | Array<JSDataset> | null
      const xAxisLabel: string | undefined = dataSource.statbankApi ? dataSource.statbankApi.xAxisLabel : undefined
      const yAxisLabel: string | undefined = dataSource.statbankApi ? dataSource.statbankApi.yAxisLabel : undefined

      // if filter get data with filter
      if (dataSource.statbankApi && dataSource.statbankApi.datasetFilterOptions && dataSource.statbankApi.datasetFilterOptions._selected) {
        const filterOptions: DatasetFilterOptions = dataSource.statbankApi.datasetFilterOptions
        getDataWithFilterStatbankApi(keyFigureViewData, municipality, filterOptions, ds, xAxisLabel, yAxisLabel)
      } else if (xAxisLabel && ds && !(ds instanceof Array)) {
        // get all data without filter
      }
    } else if (dataSource && dataSource._selected === DataSourceType.TBPROCESSOR) {
      const tbmlData: TbmlData = data as TbmlData
      if(tbmlData !== null && tbmlData.tbml.presentation) getDataTbProcessor(keyFigureViewData, tbmlData, keyFigure)
    }
    return keyFigureViewData
  } else if (keyFigure.data.manualSource) {
    keyFigureViewData.number = parseValue(keyFigure.data.manualSource.replace(/,/g, '.'))
    return keyFigureViewData
  }
  return keyFigureViewData
}

function getDataTbProcessor(
  keyFigureViewData: KeyFigureView,
  tbmlData: TbmlData,
  keyFigure: Content<KeyFigure>
): KeyFigureView {
  //
  const bodyRows: Array<TableRow> = forceArray(tbmlData.tbml.presentation.table.tbody.tr)

  const head: Array<Thead> = forceArray(tbmlData.tbml.presentation.table.thead)
    .map( (thead: Thead) => ({
      tr: forceArray(thead.tr)
    }))
  const [row1, row2] = bodyRows

  if (row1) {
    let value: number
    const td: number | PreliminaryData = forceArray(row1.td)[0] as number | PreliminaryData
    if (typeof td === 'object' && td.content != undefined) {
      value = td.content
    } else {
      value = td as number
    }
    keyFigureViewData.number = parseValue(value)
  }
  if (row2 && keyFigure.data.changes) {
    let change: number
    const td: number | PreliminaryData = forceArray(row2.td)[0] as number | PreliminaryData
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

  // the table head are sometimes an array with th's and td's, when it happens it looks like
  // the last index is the right one to pick.
  const tr: Array<TableRow> | undefined = Array.isArray(head) ? head[head.length - 1].tr as Array<TableRow> : undefined
  const th: string | number | string[] | undefined = Array.isArray(tr) ? tr[tr.length - 1].th : undefined
  keyFigureViewData.time = (forceArray(th)[0]).toString()

  return keyFigureViewData
}

function getDataWithFilterStatbankApi(
  keyFigureViewData: KeyFigureView,
  municipality: MunicipalityWithCounty | undefined,
  filterOptions: DatasetFilterOptions,
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
  if (!value || notFoundValues.includes(value.toString())) {
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
