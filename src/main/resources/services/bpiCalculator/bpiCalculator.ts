import { type Content } from '/lib/xp/content'
import { localize } from '/lib/xp/i18n'
import { type Dataset } from '/lib/types/jsonstat-toolkit'
import {
  getCalculatorConfig,
  getCalculatorDatasetFromSource,
  getChangeValue,
  isChronological,
  getIndexTime,
  getPercentageFromChangeValue,
} from '/lib/ssb/dataset/calculator'
import { HttpRequestParams } from '/lib/http-client'
import { getQuartalNumber, getFirstMonthofQuartalPeriod } from '/lib/ssb/utils/calculatorUtils'
import { type CalculatorConfig } from '/site/content-types'

interface BpiIndexes {
  calculatorData: Dataset | null
  startQuartalPeriod: string
  startYear: string
  endQuartalPeriod: string
  endYear: string
  dwellingType: string
  region: string
  language?: string
}

interface FetchBpiResults {
  startQuartalPeriod: BpiIndexes['startQuartalPeriod']
  startYear: BpiIndexes['startYear']
  endQuartalPeriod: BpiIndexes['endQuartalPeriod']
  endYear: BpiIndexes['endYear']
  language: string
  indexResult: {
    startIndex: number | null
    endIndex: number | null
  }
}

function get(req: HttpRequestParams): XP.Response {
  const dwellingType: string | undefined = req.params?.dwellingType ?? '00'
  const region: string | undefined = req.params?.region ?? 'TOTAL'
  const startQuartalPeriod: string | undefined = req.params?.startQuartalPeriod
  const startYear: string | undefined = req.params?.startYear
  const endQuartalPeriod: string | undefined = req.params?.endQuartalPeriod
  const endYear: string | undefined = req.params?.endYear
  const language: string | undefined = req.params?.language ? req.params.language : 'nb'

  if (!startQuartalPeriod || !endQuartalPeriod || !startYear || !endYear) {
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
    const indexResult = getIndexes({
      calculatorData: bpiDataset,
      startQuartalPeriod,
      startYear,
      endQuartalPeriod,
      endYear,
      dwellingType,
      region,
    })
    return fetchBpiResults({
      startQuartalPeriod,
      startYear,
      endQuartalPeriod,
      endYear,
      language,
      indexResult,
    })
  }

  return {
    status: 500,
    body: {
      error: 'missing calculator config or bpi sources',
    },
    contentType: 'application/json',
  }
}

function getIndexes({
  calculatorData,
  startQuartalPeriod,
  startYear,
  endQuartalPeriod,
  endYear,
  dwellingType,
  region,
}: BpiIndexes) {
  const startPeriod: string | undefined = startYear + startQuartalPeriod
  const endPeriod: string | undefined = endYear + endQuartalPeriod

  const parsedData = {
    Boligtype: dwellingType,
    Region: region,
  }

  const startIndex: number | null = getIndexTime(calculatorData, { ...parsedData, Tid: startPeriod })
  const endIndex: number | null = getIndexTime(calculatorData, { ...parsedData, Tid: endPeriod })

  return {
    startIndex,
    endIndex,
  }
}

function fetchBpiResults({
  startQuartalPeriod,
  startYear,
  endQuartalPeriod,
  endYear,
  language,
  indexResult,
}: FetchBpiResults) {
  const chronological: boolean = isChronological(
    startYear,
    getFirstMonthofQuartalPeriod(getQuartalNumber(startQuartalPeriod)).toString(),
    endYear,
    getFirstMonthofQuartalPeriod(getQuartalNumber(endQuartalPeriod)).toString()
  )

  if (indexResult.startIndex != null && indexResult.endIndex != null) {
    const changeValue: number = getChangeValue(indexResult.startIndex, indexResult.endIndex, chronological)
    return {
      body: {
        startIndex: indexResult.startIndex,
        endIndex: indexResult.endIndex,
        change: getPercentageFromChangeValue(changeValue),
      },
      contentType: 'application/json',
    }
  } else {
    const bpiServiceValidateStartQuartalPeriod = localize({
      key: 'bpiServiceValidateStartQuartalPeriod',
      locale: language,
    })
    const bpiServiceValidateEndQuartalPeriod = localize({
      key: 'bpiServiceValidateEndQuartalPeriod',
      locale: language,
    })

    return {
      status: 500,
      body: {
        error:
          indexResult.startIndex === null ? bpiServiceValidateStartQuartalPeriod : bpiServiceValidateEndQuartalPeriod,
      },
      contentType: 'application/json',
    }
  }
}

exports.get = get
