import { Dataset, JSONstat as JSONstatType } from '../../types/jsonstat-toolkit'
import { Content, ContentLibrary } from 'enonic-types/content'
import { CalculatorConfig } from '../../../site/content-types/calculatorConfig/calculatorConfig'
import { SSBCacheLibrary } from '../cache'
import { GenericDataImport } from '../../../site/content-types/genericDataImport/genericDataImport'
import { DatasetRepoNode } from '../../../lib/repo/dataset'
/* eslint-disable new-cap */
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import JSONstat from 'jsonstat-toolkit/import.mjs'

const {
  query, get: getContent
}: ContentLibrary = __non_webpack_require__('/lib/xp/content')
const {
  datasetOrUndefined
}: SSBCacheLibrary = __non_webpack_require__('/lib/ssb/cache')

function getKpiCalculatorData(): KpiData {
  const config: Content<CalculatorConfig> | undefined = getCalculatorConfig()

  return {
    month: config ? getKpiCalculatorDataMonth(config) : null,
    year: config ? getKpiCalculatorDataYear(config) : null
  }
}

function getKpiCalculatorDataYear(config: Content<CalculatorConfig>): Dataset | null {
  const kpiSourceYear: Content<GenericDataImport> | null = config?.data.kpiSourceYear ? getContent({
    key: config.data.kpiSourceYear
  }) : null

  const kpiDatasetYearRepo: DatasetRepoNode<JSONstatType> | null = kpiSourceYear ?
      datasetOrUndefined(kpiSourceYear) as DatasetRepoNode<JSONstatType> | null : null

  return kpiDatasetYearRepo ? JSONstat(kpiDatasetYearRepo.data).Dataset('dataset') : null
}

export function getKpiCalculatorDataMonth(config: Content<CalculatorConfig>): Dataset | null {
  const kpiSourceMonth: Content<GenericDataImport> | null = config?.data.kpiSourceMonth ? getContent({
    key: config.data.kpiSourceMonth
  }) : null

  const kpiDatasetMonthRepo: DatasetRepoNode<JSONstatType> | null = kpiSourceMonth ?
      datasetOrUndefined(kpiSourceMonth) as DatasetRepoNode<JSONstatType> | null : null

  return kpiDatasetMonthRepo ? JSONstat(kpiDatasetMonthRepo.data).Dataset('dataset') : null
}

export function getCalculatorConfig(): Content<CalculatorConfig> | undefined {
  return query({
    contentTypes: [`${app.name}:calculatorConfig`],
    count: 1,
    start: 0,
    query: ''
  }).hits[0] as Content<CalculatorConfig> | undefined
}

interface KpiData {
    month: Dataset | null;
    year: Dataset | null;
}
