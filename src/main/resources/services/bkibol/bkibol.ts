import { Content } from 'enonic-types/content'
import { Response } from 'enonic-types/controller'
import { HttpRequestParams } from 'enonic-types/http'
import { CalculatorConfig } from '../../site/content-types/calculatorConfig/calculatorConfig'
import { Dataset } from '../../lib/types/jsonstat-toolkit'
import { CalculatorLib } from '../../lib/ssb/dataset/calculator'
import { I18nLibrary } from 'enonic-types/i18n'
const i18nLib: I18nLibrary = __non_webpack_require__('/lib/xp/i18n')
const {
  getCalculatorConfig, getBkibolDatasetEnebolig, getBkibolDatasetBoligblokk, isChronological, getChangeValue
}: CalculatorLib = __non_webpack_require__('/lib/ssb/dataset/calculator')

function get(req: HttpRequestParams): Response {
  const domene: string | undefined = req.params?.domene || 'ENEBOLIG'
  const scope: string | undefined = req.params?.scope || 'ALL'
  const serie: string | undefined = req.params?.serie || 'ALL'
  const startValue: string | undefined = req.params?.startValue
  const startMonth: string | undefined = req.params?.startMonth || ''
  const startYear: string | undefined = req.params?.startYear
  const endMonth: string | undefined = req.params?.endMonth || ''
  const endYear: string | undefined = req.params?.endYear
  const language: string | undefined = req.params?.language ? req.params.language : 'nb'
  const errorValidateStartMonth: string = i18nLib.localize({
    key: 'bkibolServiceValidateStartMonth',
    locale: language
  })
  const errorValidateEndMonth: string = i18nLib.localize({
    key: 'bkibolServiceValidateEndMonth',
    locale: language
  })

  if (!domene || !serie || !serie || !startValue || !startYear || !startMonth || !endYear || !endMonth) {
    return {
      status: 400,
      body: {
        error: 'missing parameter'
      },
      contentType: 'application/json'
    }
  }

  const config: Content<CalculatorConfig> | undefined = getCalculatorConfig()

  if (config && config.data.bkibolSourceEnebolig && config.data.bkibolSourceBoligblokk) {
    const datasetEnebolig: Dataset | null = getBkibolDatasetEnebolig(config)
    const datasetBoligblokk: Dataset | null = getBkibolDatasetBoligblokk(config)
    const indexResult: IndexResult = getIndexes(domene, scope, serie, startMonth, startYear, endMonth, endYear, datasetEnebolig, datasetBoligblokk)
    const chronological: boolean = isChronological(startYear, startMonth, endYear, endMonth)
    if (indexResult.startIndex !== null && indexResult.endIndex !== null) {
      const changeValue: number = getChangeValue(indexResult.startIndex, indexResult.endIndex, chronological)
      return {
        body: {
          startIndex: indexResult.startIndex,
          endIndex: indexResult.endIndex,
          change: changeValue,
          endValue: parseFloat(startValue) * (indexResult.endIndex / indexResult.startIndex)
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
      error: 'missing calculator config or bkibol sources'
    },
    contentType: 'application/json'
  }
}
exports.get = get

function getIndexes(domene: string,
  scope: string,
  serie: string,
  startMonth: string,
  startYear: string,
  endMonth: string,
  endYear: string,
  eneboligData: Dataset | null,
  boligblokkData: Dataset | null
): IndexResult {
  const start: string = startMonth !== '' ? startYear + 'M' + startMonth : startYear
  const end: string = endMonth !== '' ? endYear + 'M' + endMonth : endYear

  const workTypeCode: string = domene === 'ENEBOLIG' ? getEneboligWorkType(scope, serie): getBoligblokkWorkType(scope, serie)

  const startIndex: null | number = domene === 'ENEBOLIG' ? getIndexTime(eneboligData, start, workTypeCode) :
    getIndexTime(boligblokkData, start, workTypeCode)

  const endIndex: null | number = domene === 'ENEBOLIG' ? getIndexTime(eneboligData, end, workTypeCode) :
    getIndexTime(boligblokkData, start, workTypeCode)

  return {
    startIndex,
    endIndex
  }
}

interface IndexResult {
    startIndex: number | null;
    endIndex: number | null;
}

function getIndexTime(bkibolData: Dataset | null, time: string, workTypeCode: string): number | null {
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  const index: null | number = bkibolData?.Data({
    Tid: time,
    Arbeidstype: workTypeCode
  }).value

  return index
}

function getEneboligWorkType(scope: string, serie: string): string {
  if (scope == 'IALT') {
    if (serie == '') {
      return '04'
    }
    if (serie == 'STEIN') {
      return '06'
    }
    if (serie == 'GRUNNARBEID') {
      return '08'
    }
    if (serie == 'BYGGEARBEIDER') {
      return '10'
    }
    if (serie == 'TOMRING') {
      return '12'
    }
    if (serie == 'MALING') {
      return '14'
    }
    if (serie == 'RORLEGGERARBEID') {
      return '16'
    }
    if (serie == 'ELEKTRIKERARBEID') {
      return '18'
    }
  } else if (scope == 'MATERIALER') {
    if (serie == '') {
      return '05'
    }
    if (serie == 'STEIN') {
      return '07'
    }
    if (serie == 'GRUNNARBEID') {
      return '09'
    }
    if (serie == 'BYGGEARBEIDER') {
      return '11'
    }
    if (serie == 'TOMRING') {
      return '13'
    }
    if (serie == 'MALING') {
      return '15'
    }
    if (serie == 'RORLEGGERARBEID') {
      return '17'
    }
    if (serie == 'ELEKTRIKERARBEID') {
      return '19'
    }
  }
  return ''
}

function getBoligblokkWorkType(scope: string, serie: string): string {
  if (scope == 'IALT') {
    if (serie == '') {
      return '20'
    }
    if (serie == 'GRUNNARBEID') {
      return '22'
    }
    if (serie == 'TOMRING') {
      return '24'
    }
    if (serie == 'MALING') {
      return '26'
    }
    if (serie == 'RORLEGGERARBEID') {
      return '28'
    }
    if (serie == 'ELEKTRIKERARBEID') {
      return '30'
    }
  } else if (scope == 'MATERIALER') {
    if (serie == '') {
      return '21'
    }
    if (serie == 'GRUNNARBEID') {
      return '23'
    }
    if (serie == 'TOMRING') {
      return '25'
    }
    if (serie == 'MALING') {
      return '27'
    }
    if (serie == 'RORLEGGERARBEID') {
      return '29'
    }
    if (serie == 'ELEKTRIKERARBEID') {
      return '31'
    }
  }
  return ''
}
