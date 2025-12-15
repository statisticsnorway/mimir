/* eslint-disable complexity */
import { type Response } from '@enonic-types/core'
import { type Content } from '/lib/xp/content'
import { localize } from '/lib/xp/i18n'
import { type Dataset } from '/lib/types/jsonstat-toolkit'
import { BPI_CALCULATOR, getCalculatorConfig, getCalculatorDatasetFromSource } from '/lib/ssb/dataset/calculator'
import {
  getChangeValue,
  isChronological,
  getIndexTime,
  getPercentageFromChangeValue,
  getQuarterNumber,
  getPublishMonthByQuarter,
  getEndValue,
  isStartIndexValid,
  isEndIndexValid,
} from '/lib/ssb/utils/calculatorUtils'
import { HttpRequestParams } from '/lib/http-client'
import { IndexResult } from '/lib/types/calculator'
import { type CalculatorConfig } from '/site/content-types'

interface BpiIndexes {
  calculatorData: Dataset | null
  startQuarterPeriod: string
  startYear: string
  endQuarterPeriod: string
  endYear: string
  dwellingType: string
  region: string
  language?: string
}

interface FetchBpiResults {
  startValue: string | undefined
  startQuarterPeriod: BpiIndexes['startQuarterPeriod']
  startYear: BpiIndexes['startYear']
  endQuarterPeriod: BpiIndexes['endQuarterPeriod']
  endYear: BpiIndexes['endYear']
  language: string
  indexResult: IndexResult
}

function get(req: HttpRequestParams): Response {
  const dwellingType: string | undefined = req.params?.dwellingType ?? '00'
  const region: string | undefined = req.params?.region ?? 'TOTAL'
  const startValue: string | undefined = req.params?.startValue
  const startQuarterPeriod: string | undefined = req.params?.startQuarterPeriod
  const startYear: string | undefined = req.params?.startYear
  const endQuarterPeriod: string | undefined = req.params?.endQuarterPeriod
  const endYear: string | undefined = req.params?.endYear
  const language: string | undefined = req.params?.language ? req.params.language : 'nb'

  if (!startValue || !startQuarterPeriod || !endQuarterPeriod || !startYear || !endYear) {
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
      ? getCalculatorDatasetFromSource(calculatorConfig, BPI_CALCULATOR)
      : null
    const indexResult = getIndexes({
      calculatorData: bpiDataset,
      startQuarterPeriod,
      startYear,
      endQuarterPeriod,
      endYear,
      dwellingType,
      region,
    })
    return fetchBpiResults({
      startValue,
      startQuarterPeriod,
      startYear,
      endQuarterPeriod,
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
  startQuarterPeriod,
  startYear,
  endQuarterPeriod,
  endYear,
  dwellingType,
  region,
}: BpiIndexes) {
  const startPeriod: string | undefined = startYear + startQuarterPeriod
  const endPeriod: string | undefined = endYear + endQuarterPeriod

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
  startValue,
  startQuarterPeriod,
  startYear,
  endQuarterPeriod,
  endYear,
  language,
  indexResult,
}: FetchBpiResults) {
  const chronological: boolean = isChronological(
    startYear,
    (getPublishMonthByQuarter(getQuarterNumber(startQuarterPeriod)) as number).toString(),
    endYear,
    (getPublishMonthByQuarter(getQuarterNumber(endQuarterPeriod)) as number).toString()
  )

  const { startIndex, endIndex } = indexResult
  if (isStartIndexValid(startIndex) && isEndIndexValid(endIndex)) {
    const changeValue: number = getChangeValue(startIndex as number, endIndex as number, chronological)
    return {
      body: {
        startIndex,
        endIndex,
        change: getPercentageFromChangeValue(changeValue),
        endValue: getEndValue(startValue as string, indexResult),
      },
      contentType: 'application/json',
    }
  } else {
    const calculatorServiceValidateStartQuarterPeriod = localize({
      key: 'calculatorServiceValidateStartQuarterPeriod',
      locale: language,
    })
    const calculatorServiceValidateEndQuarterPeriod = localize({
      key: 'calculatorServiceValidateEndQuarterPeriod',
      locale: language,
    })

    return {
      status: 500,
      body: {
        error: !isStartIndexValid(startIndex)
          ? calculatorServiceValidateStartQuarterPeriod
          : calculatorServiceValidateEndQuarterPeriod,
      },
      contentType: 'application/json',
    }
  }
}

exports.get = get
