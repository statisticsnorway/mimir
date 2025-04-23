import '/lib/ssb/polyfills/nashorn'

// @ts-ignore
import JSONstat from 'jsonstat-toolkit/import.mjs'
import { query, Content, ContentsResult } from '/lib/xp/content'
import { localize } from '/lib/xp/i18n'
import {
  type TbmlDataUniform,
  type TableRowUniform,
  type TableCellUniform,
  type PreliminaryData,
} from '/lib/types/xmlParser'
import { type Category, type Dimension, type JSONstat as JSONstatType } from '/lib/types/jsonstat-toolkit'
import {
  DatasetRepoNode,
  DataSource as DataSourceType,
  DATASET_BRANCH,
  UNPUBLISHED_DATASET_BRANCH,
} from '/lib/ssb/repo/dataset'
import { imageUrl, getImageCaption } from '/lib/ssb/utils/imageUtils'

import { datasetOrUndefined } from '/lib/ssb/cache/cache'
import * as util from '/lib/util'
import { getDataset } from '/lib/ssb/dataset/dataset'
import { localizeTimePeriod } from '/lib/ssb/utils/language'
import { createHumanReadableFormat } from '/lib/ssb/utils/utils'
import { type KeyFigureChanges, type KeyFigureView, type MunicipalData } from '/lib/types/partTypes/keyFigure'
import { type MunicipalityWithCounty } from '/lib/types/municipalities'
import { type DataSource } from '/site/mixins/dataSource'
import { type KeyFigure } from '/site/content-types'

const contentTypeName = `${app.name}:keyFigure`

export function get(keys: string | Array<string>): Array<Content<KeyFigure>> {
  keys = util.data.forceArray(keys)
  const content: ContentsResult<Content<KeyFigure>> = query({
    contentTypes: [contentTypeName],
    query: ``,
    count: keys.length,
    start: 0,
    filters: {
      ids: {
        values: keys,
      },
    },
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

interface DatasetFilterOptions {
  _selected: 'municipalityFilter'
  municipalityFilter: {
    municipalityDimension: string
  }
}

// eslint-disable-next-line complexity
export function parseKeyFigure(
  keyFigure: Content<KeyFigure & DataSource>,
  municipality?: MunicipalityWithCounty,
  branch: string = DATASET_BRANCH,
): KeyFigureView {
  const keyFigureViewData: KeyFigureView = {
    iconUrl: getIconUrl(keyFigure),
    iconAltText: keyFigure.data.icon ? getImageCaption(keyFigure.data.icon) : '',
    number: undefined,
    numberDescription: keyFigure.data.denomination,
    noNumberText: localize({
      key: 'value.notFound',
    }),
    time: keyFigure.data.manualDate || undefined, // Use manualDate if available
    size: keyFigure.data.size,
    title: keyFigure.displayName,
    changes: undefined,
    greenBox: keyFigure.data.greenBox,
    glossaryText: keyFigure.data.glossaryText,
  }

  let datasetRepo: DatasetRepoNode<JSONstatType | TbmlDataUniform | object> | undefined | null
  if (branch === UNPUBLISHED_DATASET_BRANCH) {
    datasetRepo = getDataset(keyFigure, UNPUBLISHED_DATASET_BRANCH)
  } else {
    datasetRepo = datasetOrUndefined(keyFigure)
  }

  if (datasetRepo) {
    const dataSource: DataSource['dataSource'] | undefined = keyFigure.data.dataSource
    const data: string | JSONstatType | TbmlDataUniform | object | undefined = datasetRepo.data

    if (dataSource && dataSource._selected === DataSourceType.STATBANK_API) {
      const ds: JSONstatType | null = JSONstat(data).Dataset(0)
      const xAxisLabel: string | undefined = dataSource.statbankApi ? dataSource.statbankApi.xAxisLabel : undefined
      const yAxisLabel: string | undefined = dataSource.statbankApi ? dataSource.statbankApi.yAxisLabel : undefined

      // if filter get data with filter
      if (
        dataSource.statbankApi &&
        dataSource.statbankApi.datasetFilterOptions &&
        dataSource.statbankApi.datasetFilterOptions._selected
      ) {
        const filterOptions: DatasetFilterOptions = dataSource.statbankApi.datasetFilterOptions
        getDataWithFilterStatbankApi(keyFigureViewData, municipality, filterOptions, ds, yAxisLabel)
      } else if (xAxisLabel && ds && !(ds instanceof Array)) {
        // get all data without filter
      }
    } else if (dataSource && dataSource._selected === DataSourceType.TBPROCESSOR) {
      const tbmlData: TbmlDataUniform = data as TbmlDataUniform
      if (tbmlData !== null && tbmlData.tbml.presentation)
        getDataTbProcessor(keyFigureViewData, tbmlData, keyFigure)

      // Logging Mocked keyFigure
      if (dataSource?.tbprocessor?.urlOrId === '-1' && branch === 'master') {
        log.info('MIMIR mocked Keyfigure, value:' + keyFigureViewData.number)
      }
    }
    return keyFigureViewData
  } else if (keyFigure.data.manualSource) {
    if (isNaN(parseFloat(keyFigure.data.manualSource))) {
      keyFigureViewData.number = keyFigure.data.manualSource
    } else {
      keyFigureViewData.number = parseValue(keyFigure.data.manualSource.replace(/,/g, '.'))
    }
    return keyFigureViewData
  }
  return keyFigureViewData
}

function getDataTbProcessor(
  keyFigureViewData: KeyFigureView,
  tbmlData: TbmlDataUniform,
  keyFigure: Content<KeyFigure>,
): KeyFigureView {
  const bodyRows: Array<TableRowUniform> = tbmlData.tbml.presentation.table.tbody
  const head: Array<TableRowUniform> = tbmlData.tbml.presentation.table.thead
  const [row1, row2] = bodyRows[0].tr

  if (row1) {
    const td: Array<number | string | PreliminaryData> = row1.td
    const value: number | string | PreliminaryData = td[0]

    keyFigureViewData.number = typeof value === 'object' ? parseValueZeroSafe(value.content) : parseValueZeroSafe(value)
  }
  if (row2 && keyFigure.data.changes) {
    const td: Array<number | string | PreliminaryData> = row2.td
    const value: number | string | PreliminaryData = td[0]

    let change: number | string | undefined
    if (typeof value === 'object') {
      change = value.content
    } else {
      change = value
    }
    let changeText: string | undefined = parseValue(change)

    // add denomination if there is any change
    if (changeText && keyFigure.data.changes) {
      const denomination: string | undefined = (keyFigure.data.changes as { denomination?: string }).denomination
      if (denomination) {
        changeText += ` ${denomination}`
      }
    }
    const changePeriod = row2.th.toString()
    // set arrow direction based on change
    let changeDirection: KeyFigureChanges['changeDirection'] = 'same'
    let srChangeText
    if (+change > 0) {
      changeDirection = 'up'
      const changeDirectionText = localize({
        key: 'keyFigure.increase',
      })
      srChangeText = `${changeDirectionText} ${changeText} ${changePeriod}`
    } else if (+change < 0) {
      changeDirection = 'down'
      const changeDirectionText = localize({
        key: 'keyFigure.decrease',
      })
      srChangeText = `${changeDirectionText} ${changeText} ${changePeriod}`
    } else {
      changeText = localize({
        key: 'keyFigure.noChange',
      })
    }

    keyFigureViewData.changes = {
      changeDirection,
      changeText,
      changePeriod,
      srChangeText,
    }
  }

  const tr: Array<TableCellUniform> = head[head.length - 1].tr
  const th: Array<number | string | PreliminaryData> = tr[head.length - 1].th
  keyFigureViewData.time = Array.isArray(th[0]) ? th[0].join(' ').toString() : th[0].toString()

  return keyFigureViewData
}

function getDataWithFilterStatbankApi(
  keyFigureViewData: KeyFigureView,
  municipality: MunicipalityWithCounty | undefined,
  filterOptions: DatasetFilterOptions,
  ds: JSONstat | null,
  yAxisLabel: string | undefined
): KeyFigureView {
  if (yAxisLabel && ds && !(ds instanceof Array)) {
    if (
      filterOptions &&
      filterOptions.municipalityFilter &&
      filterOptions._selected === 'municipalityFilter' &&
      municipality
    ) {
      const filterTarget: string = filterOptions.municipalityFilter.municipalityDimension
      // get value and label from json-stat data, filtering on municipality
      let municipalData: MunicipalData | null = getDataFromMunicipalityCode(
        ds,
        municipality.code,
        yAxisLabel,
        filterTarget
      )

      // not all municipals have data, so if its missing, try the old one
      if (!municipalData && municipality.changes && municipality.changes.length > 0) {
        municipalData = getDataFromMunicipalityCode(ds, municipality.changes[0].oldCode, yAxisLabel, filterTarget)
      }
      if (municipalData && municipalData.value !== null) {
        // add data to key figure view
        keyFigureViewData.number = parseValueZeroSafe(municipalData.value)
        keyFigureViewData.time = localizeTimePeriod(municipalData.label as string)
      }
    }
  }

  return keyFigureViewData
}

function getIconUrl(keyFigure: Content<KeyFigure>): string {
  let iconUrl = ''
  if (keyFigure.data.icon) {
    iconUrl = imageUrl({
      id: keyFigure.data.icon,
      scale: 'block(100,100)',
      format: 'jpg',
    })
  }
  return iconUrl
}

function getDataFromMunicipalityCode(
  ds: JSONstat,
  municipalityCode: string,
  yAxisLabel: string,
  filterTarget: string
): MunicipalData | null {
  const filterTargetIndex: number = ds.id.indexOf(filterTarget)
  const filterDimension: Dimension | null = ds.Dimension(filterTarget) as Dimension | null
  if (!filterDimension) {
    return null
  }
  const filterCategory: Category | null = filterDimension.Category(municipalityCode) as Category | null
  const filterCategoryIndex: number | undefined = filterCategory ? filterCategory.index : undefined
  const dimensionFilter: Array<number | string> = ds.id.map(() => 0)

  if (filterCategoryIndex !== undefined && filterCategoryIndex >= 0) {
    dimensionFilter[filterTargetIndex] = filterCategoryIndex
  } else {
    return null
  }

  const yAxisIndex: number = ds.id.indexOf(yAxisLabel)
  const yDimension: Dimension | Array<Dimension> | null = ds.Dimension(yAxisLabel)
  const yCategories: Category | Array<Category> | null =
    yDimension && !(yDimension instanceof Array) ? yDimension.Category() : null
  if (yCategories && Array.isArray(yCategories) && yCategories.length > 0) {
    const yCategory: Category | undefined = yCategories.shift()
    if (yCategory) {
      dimensionFilter[yAxisIndex] = yCategory.index
      const d: number | null = ds.Data(dimensionFilter, false) as number | null
      return {
        value: d,
        label: yCategory.label,
      }
    }
  }
  return null
}

function parseValueZeroSafe(value: number | string | null): string | undefined {
  if (value === 0) {
    return value.toString()
  } else {
    return parseValue(value)
  }
}

const notFoundValues: Array<string> = ['.', '..', '...', ':', '-']
function parseValue(value: number | string | null): string | undefined {
  let hasValue = true
  if (!value || notFoundValues.includes(value.toString())) {
    hasValue = false
  }
  return hasValue ? createHumanReadableFormat(value) : undefined
}
