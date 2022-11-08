import { Dataset, JSONstat as JSONstatType } from '../../types/jsonstat-toolkit'
import { query, get as getContent, Content } from '/lib/xp/content'
import type { CalculatorConfig, GenericDataImport } from '../../../site/content-types'
import { DatasetRepoNode } from '../repo/dataset'
/* eslint-disable new-cap */
// @ts-ignore
import JSONstat from 'jsonstat-toolkit/import.mjs'
import { DataSource } from '../../../site/mixins/dataSource/dataSource'

const { datasetOrUndefined } = __non_webpack_require__('/lib/ssb/cache/cache')

export function getCalculatorConfig(): Content<CalculatorConfig> | undefined {
  return query({
    contentTypes: [`${app.name}:calculatorConfig`],
    count: 1,
    start: 0,
    query: '',
    sort: 'createdTime ASC',
  }).hits[0] as Content<CalculatorConfig> | undefined
}

export function getKpiDatasetYear(config: Content<CalculatorConfig>): Dataset | null {
  const kpiSourceYear: Content<GenericDataImport & DataSource> | null = config?.data.kpiSourceYear
    ? getContent({
        key: config.data.kpiSourceYear,
      })
    : null

  if (kpiSourceYear === null) {
    log.info('Data calculator - kpiSourceYear is Null, calculatorConfig: ' + JSON.stringify(config, null, 4))
  }

  const kpiDatasetYearRepo: DatasetRepoNode<JSONstatType> | null = kpiSourceYear
    ? (datasetOrUndefined(kpiSourceYear) as DatasetRepoNode<JSONstatType> | null)
    : null

  return kpiDatasetYearRepo ? JSONstat(kpiDatasetYearRepo.data).Dataset('dataset') : null
}

export function getKpiDatasetMonth(config: Content<CalculatorConfig>): Dataset | null {
  const kpiSourceMonth: Content<GenericDataImport & DataSource> | null = config?.data.kpiSourceMonth
    ? getContent({
        key: config.data.kpiSourceMonth,
      })
    : null

  if (kpiSourceMonth === null) {
    log.info('Data calculator - kpiSourceMonth is Null, calculatorConfig: ' + JSON.stringify(config, null, 4))
  }

  const kpiDatasetMonthRepo: DatasetRepoNode<JSONstatType> | null = kpiSourceMonth
    ? (datasetOrUndefined(kpiSourceMonth) as DatasetRepoNode<JSONstatType> | null)
    : null

  return kpiDatasetMonthRepo ? JSONstat(kpiDatasetMonthRepo.data).Dataset('dataset') : null
}

export function getPifDataset(config: Content<CalculatorConfig>): Dataset | null {
  const pifSource: Content<GenericDataImport & DataSource> | null = config?.data.pifSource
    ? getContent({
        key: config.data.pifSource,
      })
    : null

  if (pifSource === null) {
    log.info('Data calculator - pifSource is Null, calculatorConfig: ' + JSON.stringify(config, null, 4))
  }

  const pifDatasetRepo: DatasetRepoNode<JSONstatType> | null = pifSource
    ? (datasetOrUndefined(pifSource) as DatasetRepoNode<JSONstatType> | null)
    : null

  return pifDatasetRepo ? JSONstat(pifDatasetRepo.data).Dataset('dataset') : null
}

export function getBkibolDatasetEnebolig(config: Content<CalculatorConfig>): Dataset | null {
  const bkibolSourceEnebolig: Content<GenericDataImport & DataSource> | null = config?.data.bkibolSourceEnebolig
    ? getContent({
        key: config.data.bkibolSourceEnebolig,
      })
    : null

  if (bkibolSourceEnebolig === null) {
    log.info('Data calculator - bkibolSourceEnebolig is Null, calculatorConfig: ' + JSON.stringify(config, null, 4))
  }

  const bkibolDatasetEneboligRepo: DatasetRepoNode<JSONstatType> | null = bkibolSourceEnebolig
    ? (datasetOrUndefined(bkibolSourceEnebolig) as DatasetRepoNode<JSONstatType> | null)
    : null

  return bkibolDatasetEneboligRepo ? JSONstat(bkibolDatasetEneboligRepo.data).Dataset('dataset') : null
}

export function getBkibolDatasetBoligblokk(config: Content<CalculatorConfig>): Dataset | null {
  const bkibolSourceBoligblokk: Content<GenericDataImport & DataSource> | null = config?.data.bkibolSourceBoligblokk
    ? getContent({
        key: config.data.bkibolSourceBoligblokk,
      })
    : null

  if (bkibolSourceBoligblokk === null) {
    log.info('Data calculator - bkibolSourceBoligblokk is Null, calculatorConfig: ' + JSON.stringify(config, null, 4))
  }

  const bkibolDatasetBoligblokkRepo: DatasetRepoNode<JSONstatType> | null = bkibolSourceBoligblokk
    ? (datasetOrUndefined(bkibolSourceBoligblokk) as DatasetRepoNode<JSONstatType> | null)
    : null

  return bkibolDatasetBoligblokkRepo ? JSONstat(bkibolDatasetBoligblokkRepo.data).Dataset('dataset') : null
}

export function getNameSearchGraphData(config: Content<CalculatorConfig>): DatasetRepoNode<JSONstatType> | null {
  const nameSearchGraphData: Content<GenericDataImport & DataSource> | null = config?.data.nameSearchGraphData
    ? getContent({
        key: config.data.nameSearchGraphData,
      })
    : null

  if (nameSearchGraphData === null) {
    log.info('Data calculator - nameSearchGraphData is Null, calculatorConfig: ' + JSON.stringify(config, null, 4))
  }

  const nameSearchGraphRepo: DatasetRepoNode<JSONstatType> | null = nameSearchGraphData
    ? (datasetOrUndefined(nameSearchGraphData) as DatasetRepoNode<JSONstatType> | null)
    : null

  return nameSearchGraphRepo
}

export function getAllCalculatorDataset(): Array<Content<GenericDataImport>> {
  const calculatorConfig: Content<CalculatorConfig> | undefined = getCalculatorConfig()
  const calculatorDatasetKeys: Array<string | undefined> = []
  if (calculatorConfig && calculatorConfig.data) {
    calculatorDatasetKeys.push(calculatorConfig.data.kpiSourceYear)
    calculatorDatasetKeys.push(calculatorConfig.data.kpiSourceMonth)
    calculatorDatasetKeys.push(calculatorConfig.data.pifSource)
    calculatorDatasetKeys.push(calculatorConfig.data.bkibolSourceEnebolig)
    calculatorDatasetKeys.push(calculatorConfig.data.bkibolSourceBoligblokk)
  }

  calculatorDatasetKeys.filter((dataset) => dataset !== undefined)

  const datasources: Array<Content<GenericDataImport>> = []
  calculatorDatasetKeys.forEach((key: string) => {
    const dataset: Content<GenericDataImport> | null = getContent({
      key: key,
    })
    if (dataset) {
      datasources.push(dataset)
    }
  })

  return datasources
}

export function isChronological(startYear: string, startMonth: string, endYear: string, endMonth: string): boolean {
  if (parseInt(startYear) < parseInt(endYear)) return true
  if (parseInt(endYear) < parseInt(startYear)) return false

  if (startMonth != ('' || '90') && endMonth != ('' || '90')) {
    if (parseInt(startMonth) < parseInt(endMonth)) return true
    if (parseInt(startMonth) > parseInt(endMonth)) return false
  }
  return true
}

export function getChangeValue(startIndex: number, endIndex: number, chronological: boolean): number {
  if (chronological) {
    return (endIndex - startIndex) / startIndex
  } else {
    return (startIndex - endIndex) / endIndex
  }
}
export interface CalculatorLib {
  getCalculatorConfig: () => Content<CalculatorConfig> | undefined
  getKpiDatasetYear: (config: Content<CalculatorConfig>) => Dataset | null
  getKpiDatasetMonth: (config: Content<CalculatorConfig> | undefined) => Dataset | null
  getPifDataset: (config: Content<CalculatorConfig> | undefined) => Dataset | null
  getBkibolDatasetEnebolig: (config: Content<CalculatorConfig>) => Dataset | null
  getBkibolDatasetBoligblokk: (config: Content<CalculatorConfig>) => Dataset | null
  getNameSearchGraphData: (config: Content<CalculatorConfig>) => DatasetRepoNode<JSONstatType> | null
  getAllCalculatorDataset: () => Array<Content<GenericDataImport>>
  isChronological: (startYear: string, startMonth: string, endYear: string, endMonth: string) => boolean
  getChangeValue: (startIndex: number, endIndex: number, chronological: boolean) => number
}
