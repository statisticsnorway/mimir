import '/lib/ssb/polyfills/nashorn'
// @ts-ignore
import JSONstat from 'jsonstat-toolkit/import.mjs'
import { query, get as getContent, Content } from '/lib/xp/content'
import { type Dataset, type JSONstat as JSONstatType } from '/lib/types/jsonstat-toolkit'
import { DatasetRepoNode } from '/lib/ssb/repo/dataset'
import { datasetOrUndefined } from '/lib/ssb/cache/cache'
import { type CalculatorConfig, type GenericDataImport } from '/site/content-types'
import { type DataSource } from '/site/mixins/dataSource'

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

export const KPI_CALCULATOR_SOURCE_YEAR = 'kpiSourceYear'
export const KPI_CALCULATOR_SOURCE_MONTH = 'kpiSourceMonth'
export const BKIBOL_CALCULATOR_SOURCE_ENEBOLIG = 'bkibolSourceEnebolig'
export const BKIBOL_CALCULATOR_SOURCE_BLOKK = 'bkibolSourceBoligblokk'
export const PIF_CALCULATOR_SOURCE = 'pifSource'
export const BPI_CALCULATOR_SOURCE = 'bpiSource'
export const PIF_CALCULATOR = 'pifCalculator'
export const BPI_CALCULATOR = 'bpiCalculator'
// TODO: Use this function to fetch calculator dataset when refactoring remaining calculators. Remember to delete old functions
export function getCalculatorDatasetFromSource(
  config: Content<CalculatorConfig>,
  calculator:
    | typeof KPI_CALCULATOR_SOURCE_YEAR
    | typeof KPI_CALCULATOR_SOURCE_MONTH
    | typeof BKIBOL_CALCULATOR_SOURCE_ENEBOLIG
    | typeof BKIBOL_CALCULATOR_SOURCE_BLOKK
    | typeof PIF_CALCULATOR
    | typeof BPI_CALCULATOR
): Dataset | null {
  let dataSourceConfig = null

  switch (calculator) {
    case KPI_CALCULATOR_SOURCE_YEAR:
      dataSourceConfig = config.data.kpiSourceYear
      break
    case KPI_CALCULATOR_SOURCE_MONTH:
      dataSourceConfig = config.data.kpiSourceMonth
      break
    case BKIBOL_CALCULATOR_SOURCE_ENEBOLIG:
      dataSourceConfig = config.data.bkibolSourceEnebolig
      break
    case BKIBOL_CALCULATOR_SOURCE_BLOKK:
      dataSourceConfig = config.data.bkibolSourceBoligblokk
      break
    case PIF_CALCULATOR:
      dataSourceConfig = config.data.pifSource
      break
    case BPI_CALCULATOR:
      dataSourceConfig = config.data.bpiSource
      break
    default:
      log.error(`Unknown calculator: ${calculator}`)
  }

  const dataSource: Content<GenericDataImport & DataSource> | null = dataSourceConfig
    ? getContent({
        key: dataSourceConfig,
      })
    : null

  if (dataSource === null) {
    log.info(`Data calculator - ${calculator} source is Null, calculatorConfig: ` + JSON.stringify(config, null, 4))
  }

  const datasetRepo: DatasetRepoNode<JSONstatType> | null = dataSource
    ? (datasetOrUndefined(dataSource) as DatasetRepoNode<JSONstatType> | null)
    : null

  return datasetRepo ? JSONstat(datasetRepo.data).Dataset('dataset') : null
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

export function getNameGraphDataWithConfig(): DatasetRepoNode<JSONstatType> | null {
  const config: Content<CalculatorConfig> | undefined = getCalculatorConfig()
  if (!config) {
    return null
  }
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
  let calculatorDatasetKeys: Array<string | undefined> = []
  if (calculatorConfig?.data) {
    calculatorDatasetKeys.push(calculatorConfig.data.kpiSourceYear)
    calculatorDatasetKeys.push(calculatorConfig.data.kpiSourceMonth)
    calculatorDatasetKeys.push(calculatorConfig.data.pifSource)
    calculatorDatasetKeys.push(calculatorConfig.data.bkibolSourceEnebolig)
    calculatorDatasetKeys.push(calculatorConfig.data.bkibolSourceBoligblokk)
    calculatorDatasetKeys.push(calculatorConfig.data.bpiSource)
  }

  calculatorDatasetKeys = calculatorDatasetKeys.filter((dataset) => dataset !== undefined)

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

export function getNameSearchGraphDatasetId(): string | undefined {
  const config: Content<CalculatorConfig> | undefined = getCalculatorConfig()
  return config?.data.nameSearchGraphData ?? undefined
}
