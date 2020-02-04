/* eslint-disable new-cap */
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import JSONstat from 'jsonstat-toolkit/import.mjs'
import { ContentLibrary, QueryResponse, Content } from 'enonic-types/lib/content'
import { PortalLibrary } from 'enonic-types/lib/portal'
import { KeyFigure } from '../../site/content-types/key-figure/key-figure'
import { Dataset } from '../../site/content-types/dataset/dataset'
import { Dataquery } from '../../site/content-types/dataquery/dataquery'
import { MunicipalityWithCounty } from '../klass/municipalities'
import { TbmlData, TableRow } from '../types/xmlParser'
import { Dataset as JSDataset, Dimension, Category } from '../types/jsonstat-toolkit'
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
} = __non_webpack_require__( '../ssb/dataset')
const {
  localizeTimePeriod
} = __non_webpack_require__( '/lib/language')
const {
  localize
} = __non_webpack_require__( '/lib/xp/i18n')
const {
  createHumanReadableFormat
} = __non_webpack_require__( '/lib/ssb/utils')

const contentTypeName: string = `${app.name}:key-figure`

export function get(key: string): Content<KeyFigure> | null {
  const content: QueryResponse<KeyFigure> = query({
    contentTypes: [contentTypeName],
    query: `_id = '${key}'`,
    count: 1,
    start: 0
  })
  return content.count === 1 ? content.hits[0] : null
}

type JsonStatFormat = Dataquery['datasetFormat']['jsonStat'];
type DatasetOption = NonNullable<JsonStatFormat>['datasetFilterOptions']

export function parseKeyFigure(keyFigure: Content<KeyFigure>, municipality?: MunicipalityWithCounty): KeyFigureView {
  const keyFigureViewData: KeyFigureView = {
    iconUrl: getIconUrl(keyFigure),
    number: undefined,
    numberDescription: keyFigure.data.denomination,
    noNumberText: localize({
      key: 'value.notFound'
    }),
    time: undefined,
    size: keyFigure.data.size,
    title: keyFigure.displayName,
    changes: undefined
  }

  const dataQueryId: string | undefined = keyFigure.data.dataquery
  if (dataQueryId) {
    const dataQueryContent: Content<Dataquery> = getDataquery({
      key: dataQueryId
    })
    const datasetContent: QueryResponse<Dataset> = getDataSetWithDataQueryId(dataQueryId)
    const datasetFormat: Dataquery['datasetFormat'] = dataQueryContent.data.datasetFormat
    const data: object | TbmlData = JSON.parse(datasetContent.hits[0].data.json)
    if (datasetFormat._selected === 'jsonStat') {
      // prepare jsonstat
      const ds: JSDataset | Array<JSDataset> | null = JSONstat(data).Dataset(0)
      const jsonStatConfig: JsonStatFormat | undefined = datasetFormat[datasetFormat._selected]
      const xAxisLabel: string | undefined = jsonStatConfig ? jsonStatConfig.xAxisLabel : undefined
      const yAxisLabel: string | undefined = jsonStatConfig ? jsonStatConfig.yAxisLabel : undefined

      // if filter get data with filter
      if (jsonStatConfig && jsonStatConfig.datasetFilterOptions && jsonStatConfig.datasetFilterOptions._selected) {
        const filterOptions: DatasetOption = jsonStatConfig.datasetFilterOptions

        if (yAxisLabel && ds && !(ds instanceof Array)) {
          if (filterOptions && filterOptions.municipalityFilter && filterOptions._selected === 'municipalityFilter' && municipality) {
            const filterTarget: string = filterOptions.municipalityFilter.municipalityDimension
            // get value and label from json-stat data, filtering on municipality
            let municipalData: MunicipalData | null = getDataFromMunicipalityCode(ds, municipality.code, yAxisLabel, filterTarget)
            // not all municipals have data, so if its missing, try the old one
            if ((!municipalData || municipalData.value === null) && municipality.changes) {
              municipalData = getDataFromMunicipalityCode(ds, municipality.changes[0].oldCode, yAxisLabel, filterTarget)
            }
            if (municipalData && municipalData.value !== null) {
              // add data to key figure view
              keyFigureViewData.number = parseValue(municipalData.value)
              keyFigureViewData.time = localizeTimePeriod(municipalData.label)
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
      const [row1, row2] = bodyRows
      if (row1) {
        if (Array.isArray(row1.td)) {
          keyFigureViewData.number = parseValue(row1.td[0])
        } else {
          keyFigureViewData.number = parseValue(row1.td)
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
        keyFigureViewData.changes = {
          changeDirection: direction,
          changeText: parseValue(change),
          changePeriod: row2.th.toString()
        }
      }
      if (Array.isArray(head.th)) {
        keyFigureViewData.time = head.th[0]
      } else {
        keyFigureViewData.time = head.th.toString()
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
  number?: string;
  numberDescription?: string;
  noNumberText: string;
  size?: string;
  title: string;
  time?: string;
  changes?: KeyFigureChanges;
}

export interface KeyFigureChanges {
  changeDirection: 'up' | 'down' | 'same';
  changeText?: string;
  changePeriod: string;
}
