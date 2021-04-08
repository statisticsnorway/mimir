import { Content, ContentLibrary } from 'enonic-types/content'
import { Response } from 'enonic-types/controller'
import { HttpRequestParams } from 'enonic-types/http'
import { CalculatorConfig } from '../../site/content-types/calculatorConfig/calculatorConfig'
import { GenericDataImport } from '../../site/content-types/genericDataImport/genericDataImport'
import { SSBCacheLibrary } from '../../lib/ssb/cache'
import { DatasetRepoNode } from '../../lib/repo/dataset'
import { Category, Dataset, Dimension, JSONstat as JSONstatType } from '../../lib/types/jsonstat-toolkit'
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

function get(req: HttpRequestParams): Response {
  const startValue: string | undefined = req.params?.startValue
  const startMonth: string | undefined = req.params?.startMonth || '90'
  const startYear: string | undefined = req.params?.startYear
  const endMonth: string | undefined = req.params?.endMonth || '90'
  const endYear: string | undefined = req.params?.endYear
  if (!startValue || !startMonth || !startYear || !endMonth || !endYear) {
    return {
      status: 400,
      body: {
        error: 'missing paramter'
      },
      contentType: 'applcation/json'
    }
  }
  const config: Content<CalculatorConfig> | undefined = query({
    contentTypes: [`${app.name}:calculatorConfig`],
    count: 1,
    start: 0,
    query: ''
  }).hits[0] as Content<CalculatorConfig> | undefined
  if (config && config.data.kpiSourceMonth && config.data.kpiSourceYear) {
    // TODO fetch after checking year < 1920
    const kpiSourceMonth: Content<GenericDataImport> | null = getContent({
      key: config.data.kpiSourceMonth
    })
    const kpiSourceYear: Content<GenericDataImport> | null = getContent({
      key: config.data.kpiSourceYear
    })
    if (kpiSourceMonth && kpiSourceYear) {
      const kpiDatasetMonthRepo: DatasetRepoNode<JSONstatType> | undefined = datasetOrUndefined(kpiSourceMonth) as DatasetRepoNode<JSONstatType> | undefined
      if (kpiDatasetMonthRepo) {
        const kpiDatasetMonth: Dataset | null = JSONstat(kpiDatasetMonthRepo.data).Dataset('dataset')
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        const startIndex: number = kpiDatasetMonth?.Data({
          Tid: startYear,
          Maaned: startMonth
        }).value
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        const endIndex: number = kpiDatasetMonth?.Data({
          Tid: endYear,
          Maaned: endMonth
        }).value
        const chronological: boolean = isChronological(startYear, startMonth, endYear, endMonth)
        const changeValue: number = getChangeValue(startIndex, endIndex, chronological)
        return {
          body: {
            endValue: parseInt(startValue) * (endIndex / startIndex),
            change: changeValue
          },
          contentType: 'application/json'
        }
      }
    }
  }
  return {
    status: 500,
    body: {
      error: 'missing calculator config or kpi sources'
    },
    contentType: 'applcation/json'
  }
}
exports.get = get

function getIndexes(startYear: string, startMonth: string, endYear: string, endMonth: string): IndexResult {
  const startIndex: null | number = null
  if (parseInt(startYear) < 1920) {

  } else {

  }
  const endIndex: null | number = null
  // const endIndexDataset =
  if (parseInt(endYear) < 1920) {

  } else {

  }
  // endIndex = endIndexDataset?.Data({
  //   Tid: endYear,
  //   Maaned: endMonth
  // }).value
  return {
    startIndex,
    endIndex
  }
}

interface IndexResult {
  startIndex: number | null;
  endIndex: number | null;
}

function getChangeValue(startIndex: number, endIndex: number, chronological: boolean): number {
  if (chronological) {
    return ((endIndex - startIndex) / startIndex)
  } else {
    return ((startIndex - endIndex) / endIndex)
  }
}

function isChronological(startYear: string, startMonth: string, endYear: string, endMonth: string): boolean {
  if (parseInt(startYear) < parseInt(endYear)) return true
  if (parseInt(endYear) < parseInt(startYear)) return false

  if (startMonth != '90' && endMonth != '90') {
    if (parseInt(startMonth) < parseInt(endMonth)) return true
    if (parseInt(startMonth) > parseInt(endMonth)) return false
  }
  return true
}
