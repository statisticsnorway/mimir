import { Content } from '/lib/xp/content'
import { HttpRequestParams } from 'enonic-types/http'
import { CalculatorConfig } from '../../site/content-types/calculatorConfig/calculatorConfig'
import { Dataset } from '../../lib/types/jsonstat-toolkit'
const {
  localize
} = __non_webpack_require__('/lib/xp/i18n')
const {
  getCalculatorConfig, getKpiDatasetYear, getKpiDatasetMonth, isChronological, getChangeValue
} = __non_webpack_require__('/lib/ssb/dataset/calculator')

function get(req: HttpRequestParams): XP.Response {
  const startValue: string | undefined = req.params?.startValue
  const startMonth: string | undefined = req.params?.startMonth || '90'
  const startYear: string | undefined = req.params?.startYear
  const endMonth: string | undefined = req.params?.endMonth || '90'
  const endYear: string | undefined = req.params?.endYear
  const language: string | undefined = req.params?.language ? req.params.language : 'nb'
  const errorValidateStartMonth: string = localize({
    key: 'kpiServiceValidateStartMonth',
    locale: language
  })
  const errorValidateEndMonth: string = localize({
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

  const config: Content<CalculatorConfig> | undefined = getCalculatorConfig()

  if (config && config.data.kpiSourceMonth && config.data.kpiSourceYear) {
    const kpiDatasetYear: Dataset | null = parseInt(startYear) < 1920 || parseInt(endYear) < 1920 ?
      getKpiDatasetYear(config) : null
    const kpiDatasetMonth: Dataset | null = parseInt(startYear) >= 1920 || parseInt(endYear) >= 1920 ?
      getKpiDatasetMonth(config) : null

    const kpiData: KpiData = {
      month: kpiDatasetMonth,
      year: kpiDatasetYear
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
