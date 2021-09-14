import { Dataset, JSONstat as JSONstatType } from '../../types/jsonstat-toolkit'
import { Content } from 'enonic-types/content'
import { CalculatorConfig } from '../../../site/content-types/calculatorConfig/calculatorConfig'
import { GenericDataImport } from '../../../site/content-types/genericDataImport/genericDataImport'
import { DatasetRepoNode } from '../repo/dataset'
/* eslint-disable new-cap */
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import JSONstat from 'jsonstat-toolkit/import.mjs'
import { DataSource } from '../../../site/mixins/dataSource/dataSource'

const {
  query, get: getContent
} = __non_webpack_require__('/lib/xp/content')
const {
  datasetOrUndefined
} = __non_webpack_require__('/lib/ssb/cache/cache')

export function getCalculatorConfig(): Content<CalculatorConfig> | undefined {
  return query({
    contentTypes: [`${app.name}:calculatorConfig`],
    count: 1,
    start: 0,
    query: ''
  }).hits[0] as Content<CalculatorConfig> | undefined
}

export function getKpiDatasetYear(config: Content<CalculatorConfig>): Dataset | null {
  const kpiSourceYear: Content<GenericDataImport & DataSource> | null = config?.data.kpiSourceYear ? getContent({
    key: config.data.kpiSourceYear
  }) : null

  const kpiDatasetYearRepo: DatasetRepoNode<JSONstatType> | null = kpiSourceYear ?
      datasetOrUndefined(kpiSourceYear) as DatasetRepoNode<JSONstatType> | null : null

  return kpiDatasetYearRepo ? JSONstat(kpiDatasetYearRepo.data).Dataset('dataset') : null
}

export function getKpiDatasetMonth(config: Content<CalculatorConfig>): Dataset | null {
  const kpiSourceMonth: Content<GenericDataImport & DataSource> | null = config?.data.kpiSourceMonth ? getContent({
    key: config.data.kpiSourceMonth
  }) : null

  const kpiDatasetMonthRepo: DatasetRepoNode<JSONstatType> | null = kpiSourceMonth ?
      datasetOrUndefined(kpiSourceMonth) as DatasetRepoNode<JSONstatType> | null : null

  return kpiDatasetMonthRepo ? JSONstat(kpiDatasetMonthRepo.data).Dataset('dataset') : null
}

export function getPifDataset(config: Content<CalculatorConfig>): Dataset | null {
  const pifSource: Content<GenericDataImport & DataSource> | null = config?.data.pifSource ? getContent({
    key: config.data.pifSource
  }) : null

  const pifDatasetRepo: DatasetRepoNode<JSONstatType> | null = pifSource ?
      datasetOrUndefined(pifSource) as DatasetRepoNode<JSONstatType> | null : null

  return pifDatasetRepo ? JSONstat(pifDatasetRepo.data).Dataset('dataset') : null
}

export function getBkibolDatasetEnebolig(config: Content<CalculatorConfig>): Dataset | null {
  const bkibolSourceEnebolig: Content<GenericDataImport & DataSource> | null = config?.data.bkibolSourceEnebolig ? getContent({
    key: config.data.bkibolSourceEnebolig
  }) : null

  const bkibolDatasetEneboligRepo: DatasetRepoNode<JSONstatType> | null = bkibolSourceEnebolig ?
      datasetOrUndefined(bkibolSourceEnebolig) as DatasetRepoNode<JSONstatType> | null : null

  return bkibolDatasetEneboligRepo ? JSONstat(bkibolDatasetEneboligRepo.data).Dataset('dataset') : null
}

export function getBkibolDatasetBoligblokk(config: Content<CalculatorConfig>): Dataset | null {
  const bkibolSourceBoligblokk: Content<GenericDataImport & DataSource> | null = config?.data.bkibolSourceBoligblokk ? getContent({
    key: config.data.bkibolSourceBoligblokk
  }) : null

  const bkibolDatasetBoligblokkRepo: DatasetRepoNode<JSONstatType> | null = bkibolSourceBoligblokk ?
      datasetOrUndefined(bkibolSourceBoligblokk) as DatasetRepoNode<JSONstatType> | null : null

  return bkibolDatasetBoligblokkRepo ? JSONstat(bkibolDatasetBoligblokkRepo.data).Dataset('dataset') : null
}

export function getNameSearchGraphData(config: Content<CalculatorConfig>): DatasetRepoNode<JSONstatType>  | null {
  const nameSearchGraphData: Content<GenericDataImport & DataSource> | null = config?.data.nameSearchGraphData ? getContent({
    key: config.data.nameSearchGraphData
  }) : null

  const bkibolDatasetBoligblokkRepo: DatasetRepoNode<JSONstatType> | null = nameSearchGraphData ?
      datasetOrUndefined(nameSearchGraphData) as DatasetRepoNode<JSONstatType> | null : null

  return bkibolDatasetBoligblokkRepo // ? JSONstat(bkibolDatasetBoligblokkRepo.data).Dataset('dataset') : null
}

export function isChronological(startYear: string, startMonth: string, endYear: string, endMonth: string): boolean {
  if (parseInt(startYear) < parseInt(endYear)) return true
  if (parseInt(endYear) < parseInt(startYear)) return false

  if (startMonth != ('' || '90') && endMonth != ('' || '90') ) {
    if (parseInt(startMonth) < parseInt(endMonth)) return true
    if (parseInt(startMonth) > parseInt(endMonth)) return false
  }
  return true
}

export function getChangeValue(startIndex: number, endIndex: number, chronological: boolean): number {
  if (chronological) {
    return ((endIndex - startIndex) / startIndex)
  } else {
    return ((startIndex - endIndex) / endIndex)
  }
}

export interface CalculatorLib {
  getCalculatorConfig: () => Content<CalculatorConfig> | undefined;
  getKpiDatasetYear: (config: Content<CalculatorConfig>) => Dataset | null;
  getKpiDatasetMonth: (config: Content<CalculatorConfig>) => Dataset | null;
  getPifDataset: (config: Content<CalculatorConfig>) => Dataset | null;
  getBkibolDatasetEnebolig: (config: Content<CalculatorConfig>) => Dataset | null;
  getBkibolDatasetBoligblokk: (config: Content<CalculatorConfig>) => Dataset | null;
  getNameSearchGraphData: (config: Content<CalculatorConfig>) => DatasetRepoNode<JSONstatType>  | null;
  isChronological: (startYear: string, startMonth: string, endYear: string, endMonth: string) => boolean;
  getChangeValue: (startIndex: number, endIndex: number, chronological: boolean) => number;
}
