import { Content, ContentLibrary } from 'enonic-types/content'
import { Response } from 'enonic-types/controller'
import { HttpRequestParams } from 'enonic-types/http'
import { CalculatorConfig } from '../../site/content-types/calculatorConfig/calculatorConfig'
import { GenericDataImport } from '../../site/content-types/genericDataImport/genericDataImport'
import { SSBCacheLibrary } from '../../lib/ssb/cache'
import { DatasetRepoNode } from '../../lib/repo/dataset'
import { Dataset, JSONstat as JSONstatType } from '../../lib/types/jsonstat-toolkit'
/* eslint-disable new-cap */
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import JSONstat from 'jsonstat-toolkit/import.mjs'
import { I18nLibrary } from 'enonic-types/i18n'
const i18nLib: I18nLibrary = __non_webpack_require__('/lib/xp/i18n')
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
  const language: string | undefined = req.params?.language ? req.params.language : 'nb'
  const errorValidateStartMonth: string = i18nLib.localize({
    key: 'kpiServiceValidateStartMonth',
    locale: language
  })
  const errorValidateEndMonth: string = i18nLib.localize({
    key: 'kpiServiceValidateEndMonth',
    locale: language
  })

  if (!startValue || !startMonth || !startYear || !endMonth || !endYear) {
    return {
      status: 400,
      body: {
        error: 'missing parameter'
      },
      contentType: 'application/json'
    }
  }
  const config: Content<CalculatorConfig> | undefined = query({
    contentTypes: [`${app.name}:calculatorConfig`],
    count: 1,
    start: 0,
    query: ''
  }).hits[0] as Content<CalculatorConfig> | undefined
  if (config && config.data.kpiSourceMonth && config.data.kpiSourceYear) {
    const kpiSourceMonth: Content<GenericDataImport> | null = parseInt(startYear) >= 1920 || parseInt(endYear) >= 1920 ? getContent({
      key: config.data.kpiSourceMonth
    }) : null
    const kpiSourceYear: Content<GenericDataImport> | null = parseInt(startYear) < 1920 || parseInt(endYear) < 1920 ? getContent({
      key: config.data.kpiSourceYear
    }) : null

    const kpiDatasetMonthRepo: DatasetRepoNode<JSONstatType> | null = kpiSourceMonth ?
        datasetOrUndefined(kpiSourceMonth) as DatasetRepoNode<JSONstatType> | null : null
    const kpiDatasetYearRepo: DatasetRepoNode<JSONstatType> | null = kpiSourceYear ?
        datasetOrUndefined(kpiSourceYear) as DatasetRepoNode<JSONstatType> | null : null

    const kpiData: KpiData = {
      month: kpiDatasetMonthRepo ? JSONstat(kpiDatasetMonthRepo.data).Dataset('dataset') : null,
      year: kpiDatasetYearRepo ? JSONstat(kpiDatasetYearRepo.data).Dataset('dataset') : null
    }

    const indexResult: IndexResult = getIndexes(startYear, startMonth, endYear, endMonth, kpiData)
    const chronological: boolean = isChronological(startYear, startMonth, endYear, endMonth)
    if (indexResult.startIndex !== null && indexResult.endIndex !== null) {
      const changeValue: number = getChangeValue(indexResult.startIndex, indexResult.endIndex, chronological)
      return {
        body: {
          endValue: parseFloat(startValue) * (indexResult.endIndex / indexResult.startIndex),
          change: changeValue
        },
        contentType: 'application/json'
      }
    } else {
      return {
        status: 500,
        body: {
          error: indexResult.startIndex === null ? errorValidateStartMonth : errorValidateEndMonth
        },
        contentType: 'application/json'
      }
    }
  }
  return {
    status: 500,
    body: {
      error: 'missing calculator config or kpi sources'
    },
    contentType: 'application/json'
  }
}
exports.get = get

function getIndexes(startYear: string, startMonth: string, endYear: string, endMonth: string, kpiData: KpiData): IndexResult {
  let startIndex: null | number = null
  let endIndex: null | number = null

  if (parseInt(startYear) < 1920) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    startIndex = kpiData.year?.Data({
      Tid: startYear
    }).value
  } else {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    startIndex = kpiData.month?.Data({
      Tid: startYear,
      Maaned: startMonth
    }).value
  }

  if (parseInt(endYear) < 1920) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    endIndex = kpiData.year?.Data({
      Tid: endYear
    }).value
  } else {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    endIndex = kpiData.month?.Data({
      Tid: endYear,
      Maaned: endMonth
    }).value
  }
  return {
    startIndex,
    endIndex
  }
}

interface IndexResult {
  startIndex: number | null;
  endIndex: number | null;
}

interface KpiData {
  month: Dataset | null;
  year: Dataset | null;
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
