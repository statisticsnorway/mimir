import '/lib/ssb/polyfills/nashorn'

// @ts-ignore
import JSONstat from 'jsonstat-toolkit/import.mjs'
import { query, type Content } from '/lib/xp/content'
import { localize } from '/lib/xp/i18n'
import { type TbmlDataUniform, type TableCellUniform, type PreliminaryData } from '/lib/types/xmlParser'
import { type Category, type Dimension, type JSONstat as JSONStatType } from '/lib/types/jsonstat-toolkit'
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

interface DatasetFilterOptions {
  _selected: 'municipalityFilter'
  municipalityFilter: {
    municipalityDimension: string
  }
}

export function get(inputKeys: string | Array<string>): Array<Content<KeyFigure>> {
  const contentTypeName = `${app.name}:keyFigure`
  const keys = util.data.forceArray(inputKeys)
  const content = query({
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
  const hits = keys.reduce((keyfigures: Array<Content<KeyFigure>>, id: string) => {
    const found = content.hits.filter((keyFigure) => keyFigure._id === id)
    if (found.length === 1) {
      keyfigures.push(found[0] as Content<KeyFigure>)
    }
    return keyfigures
  }, [])
  return hits
}

function getDatasetRepo(
  keyFigure: Content<KeyFigure & DataSource>,
  branch: string
): DatasetRepoNode<JSONstat | TbmlDataUniform | object> | undefined | null {
  if (branch === UNPUBLISHED_DATASET_BRANCH) {
    return getDataset(keyFigure, UNPUBLISHED_DATASET_BRANCH)
  } else {
    return datasetOrUndefined(keyFigure)
  }
}

export function parseKeyFigure(
  keyFigure: Content<KeyFigure & DataSource>,
  municipality?: MunicipalityWithCounty,
  branch: string = DATASET_BRANCH,
  language?: string
): KeyFigureView {
  const keyFigureViewData: KeyFigureView = {
    iconUrl: getIconUrl(keyFigure),
    iconAltText: getImageCaption(keyFigure.data.icon),
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

  const datasetRepo = getDatasetRepo(keyFigure, branch)
  if (datasetRepo) {
    const dataSource = keyFigure.data.dataSource
    const data = datasetRepo.data

    if (dataSource) {
      if (dataSource._selected === DataSourceType.STATBANK_API) {
        return getDataApi(keyFigureViewData, municipality, data, dataSource.statbankApi)
      }

      if (dataSource._selected === DataSourceType.PXAPI) {
        return getDataApi(keyFigureViewData, municipality, data, dataSource.pxapi)
      }

      if (dataSource._selected === DataSourceType.TBPROCESSOR) {
        const tbmlData: TbmlDataUniform = data as TbmlDataUniform
        if (tbmlData !== null && tbmlData.tbml.presentation)
          return getDataTbProcessor(keyFigureViewData, tbmlData, keyFigure, language)

        // Logging Mocked keyFigure
        if (dataSource?.tbprocessor?.urlOrId === '-1' && branch === 'master') {
          log.info('MIMIR mocked Keyfigure, value:' + keyFigureViewData.number)
        }
      }
      return keyFigureViewData
    }
  }

  if (keyFigure.data.manualSource) {
    return getManualSource(keyFigure.data.manualSource, keyFigureViewData)
  }

  return keyFigureViewData
}

function getDataTbProcessor(
  keyFigureViewData: KeyFigureView,
  tbmlData: TbmlDataUniform,
  keyFigure: Content<KeyFigure>,
  language?: string
): KeyFigureView {
  const bodyRows = tbmlData.tbml.presentation.table.tbody
  const head = tbmlData.tbml.presentation.table.thead
  const [row1, row2] = bodyRows[0].tr

  if (row1) {
    const td = row1.td
    const value = td[0]

    keyFigureViewData.number = typeof value === 'object' ? parseValueZeroSafe(value.content) : parseValueZeroSafe(value)
  }
  if (row2 && keyFigure.data.changes) {
    const td = row2.td
    const value = td[0]

    let change
    if (typeof value === 'object') {
      change = value.content
    } else {
      change = value
    }
    let changeText = parseValue(change)

    // add denomination if there is any change
    if (changeText && keyFigure.data.changes) {
      const denomination = (keyFigure.data.changes as { denomination?: string }).denomination
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
        locale: language,
      })
      srChangeText = `${changeDirectionText} ${changeText} ${changePeriod}`
    } else if (+change < 0) {
      changeDirection = 'down'
      const changeDirectionText = localize({
        key: 'keyFigure.decrease',
        locale: language,
      })
      srChangeText = `${changeDirectionText} ${changeText} ${changePeriod}`
    } else {
      changeText = localize({
        key: 'keyFigure.noChange',
        locale: language,
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

function getDataApi(
  keyFigureView: KeyFigureView,
  municipality: MunicipalityWithCounty | undefined,
  data: JSONStatType,
  dataSource:
    | Extract<KeyFigure['dataSource'], { _selected: 'statbankApi' }>['statbankApi']
    | Extract<KeyFigure['dataSource'], { _selected: 'pxapi' }>['pxapi']
): KeyFigureView {
  const parsedDs = typeof data === 'string' ? JSON.parse(data) : data
  const ds = JSONstat(parsedDs).Dataset(0)
  const yAxisLabel = dataSource?.yAxisLabel

  if (dataSource && dataSource.datasetFilterOptions && dataSource.datasetFilterOptions._selected) {
    const filterOptions: DatasetFilterOptions = dataSource.datasetFilterOptions
    return getDataWithFilterStatbankApi(keyFigureView, municipality, filterOptions, ds, yAxisLabel)
  }

  if (ds && !Array.isArray(ds)) {
    return getDataWithoutFilterApi(keyFigureView, ds, yAxisLabel)
  }

  return keyFigureView
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
      const filterTarget = filterOptions.municipalityFilter.municipalityDimension
      // get value and label from json-stat data, filtering on municipality
      let municipalData = getDataFromMunicipalityCode(ds, municipality.code, yAxisLabel, filterTarget)

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

function getDataWithoutFilterApi(
  keyFigureViewData: KeyFigureView,
  ds: JSONstat,
  yAxisLabel: string | undefined
): KeyFigureView {
  const getFirstDimension: Array<number> = ds.id.map(() => 0)
  const value = ds.Data(getFirstDimension, false)

  if (value !== null) {
    keyFigureViewData.number = parseValueZeroSafe(value)
  }

  const yAxisIndex = ds.id.indexOf(yAxisLabel)
  const yDimension = ds.Dimension(yAxisLabel)
  const yCategories = yDimension && !(yDimension instanceof Array) ? yDimension.Category() : null
  if (yCategories && Array.isArray(yCategories) && yCategories.length > 0) {
    const yCategory = yCategories.shift()
    if (yCategory) {
      getFirstDimension[yAxisIndex] = yCategory.index
      keyFigureViewData.time = yCategory.label
    }
  }
  return keyFigureViewData
}

function getManualSource(manualSource: KeyFigure['manualSource'], keyFigureViewData: KeyFigureView): KeyFigureView {
  if (!manualSource) return keyFigureViewData

  if (isNaN(parseFloat(manualSource))) {
    keyFigureViewData.number = manualSource
  } else {
    keyFigureViewData.number = parseValue(manualSource.replace(/,/g, '.'))
  }
  return keyFigureViewData
}

function getDataFromMunicipalityCode(
  ds: JSONstat,
  municipalityCode: string,
  yAxisLabel: string,
  filterTarget: string
): MunicipalData | null {
  const filterTargetIndex = ds.id.indexOf(filterTarget)
  const filterDimension = ds.Dimension(filterTarget) as Dimension | null
  if (!filterDimension) {
    return null
  }
  const filterCategory = filterDimension.Category(municipalityCode) as Category | null
  const filterCategoryIndex = filterCategory ? filterCategory.index : undefined
  const dimensionFilter = ds.id.map(() => 0)

  if (filterCategoryIndex !== undefined && filterCategoryIndex >= 0) {
    dimensionFilter[filterTargetIndex] = filterCategoryIndex
  } else {
    return null
  }

  const yAxisIndex = ds.id.indexOf(yAxisLabel)
  const yDimension = ds.Dimension(yAxisLabel)
  const yCategories = yDimension && !(yDimension instanceof Array) ? yDimension.Category() : null
  if (yCategories && Array.isArray(yCategories) && yCategories.length > 0) {
    const yCategory = yCategories.shift()
    if (yCategory) {
      dimensionFilter[yAxisIndex] = yCategory.index
      const d = ds.Data(dimensionFilter, false) as number | null
      return {
        value: d,
        label: yCategory.label,
      }
    }
  }
  return null
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

function parseValueZeroSafe(value: number | string | null): string | undefined {
  if (value === 0) {
    return value.toString()
  } else {
    return parseValue(value)
  }
}

function parseValue(value: number | string | null): string | undefined {
  const notFoundValues: Array<string> = ['.', '..', '...', ':', '-']

  let hasValue = true
  if (!value || notFoundValues.includes(value.toString())) {
    hasValue = false
  }
  return hasValue ? createHumanReadableFormat(value) : undefined
}
