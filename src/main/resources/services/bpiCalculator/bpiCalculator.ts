import { type Content } from '/lib/xp/content'
import { type Dataset } from '/lib/types/jsonstat-toolkit'
import { getCalculatorConfig, getCalculatorDatasetFromSource, getChangeValue, isChronological } from '/lib/ssb/dataset/calculator'
import { type CalculatorConfig } from '/site/content-types'
import { getIndexTime } from '/lib/ssb/dataset/calculator'
import { HttpRequestParams } from '/lib/http-client'
import { localize } from '/lib/xp/i18n'

function get(req: HttpRequestParams): XP.Response {
  const dwellingType: string | undefined = req.params?.dwellingType ?? '00'
  const region: string | undefined = req.params?.region ?? 'TOTAL'
  const startQuartalPeriod: string | undefined = req.params?.startQuartalPeriod
  const startYear: string | undefined = req.params?.startYear
  const endQuartalPeriod: string | undefined = req.params?.endQuartalPeriod
  const endYear: string | undefined = req.params?.endYear
  const language: string | undefined = req.params?.language ? req.params.language : 'nb'

  if (!region || !startQuartalPeriod || !endQuartalPeriod || !startYear || !endYear) {
    return {
      status: 400,
      body: {
        error: 'missing parameter',
      },
      contentType: 'application/json',
    }
  }

  const calculatorConfig: Content<CalculatorConfig> | undefined = getCalculatorConfig()
  if (calculatorConfig?.data?.bpiSource) {
    const bpiDataset: Dataset | null = calculatorConfig
      ? getCalculatorDatasetFromSource(calculatorConfig, 'bpiCalculator')
      : null

    const indexResult = getIndexes(bpiDataset, startQuartalPeriod, startYear, endQuartalPeriod, endYear, dwellingType, region)
    const chronological: boolean = isChronological(startYear, startQuartalPeriod.substring(1), endYear, endQuartalPeriod.substring(1)) // Extract number from e.g. "K1" for quartal periods

    if (indexResult.startIndex != null && indexResult.endIndex != null) {
      const changeValue: number = getChangeValue(indexResult.startIndex, indexResult.endIndex, chronological)
      return {
        body: {
          startIndex: indexResult.startIndex,
          endIndex: indexResult.endIndex,
          change: changeValue,
        },
        contentType: 'application/json',
      }
    } else {
      // TODO: Change for quartal
      const kpiServiceValidateStartMonth = localize({
        key: 'kpiServiceValidateStartMonth',
        locale: language
      })
      const kpiServiceValidateEndMonth = localize({
        key: 'kpiServiceValidateStartMonth',
        locale: language
      })

      return {
        status: 500,
        body: {
          error: indexResult.startIndex === null ? kpiServiceValidateStartMonth : kpiServiceValidateEndMonth,
        },
        contentType: 'application/json',
      }
    }
  }

  return {
    status: 500,
    body: {
      error: 'missing calculator config or bpi sources',
    },
    contentType: 'application/json',
  }
}

function getIndexes(calculatorData: Dataset | null, startQuartalPeriod: string, startYear: string, endQuartalPeriod: string, endYear: string, dwellingType: string, region: string) {
  const startPeriod: string | undefined = startYear + startQuartalPeriod
  const endPeriod: string | undefined = endYear + endQuartalPeriod

  const parsedData = {
    ContentsCode: 'Boligindeks',
    Tid: startPeriod,
    Boligtype: dwellingType,
    Region: region
  }

  const startIndex: number | null = getIndexTime(calculatorData, { ...parsedData, Tid: startPeriod })
  const endIndex: number | null = getIndexTime(calculatorData, { ...parsedData, Tid: endPeriod })

  return {
    startIndex,
    endIndex
  }
}

exports.get = get
