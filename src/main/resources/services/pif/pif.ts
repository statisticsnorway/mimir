import { Content } from 'enonic-types/content'
import { Response } from 'enonic-types/controller'
import { HttpRequestParams } from 'enonic-types/http'
import { CalculatorConfig } from '../../site/content-types/calculatorConfig/calculatorConfig'
import { Dataset } from '../../lib/types/jsonstat-toolkit'
import { CalculatorLib } from '../../lib/ssb/dataset/calculator'
import { I18nLibrary } from 'enonic-types/i18n'
const i18nLib: I18nLibrary = __non_webpack_require__('/lib/xp/i18n')
const {
  getCalculatorConfig, getPifDataset
}: CalculatorLib = __non_webpack_require__('/lib/ssb/dataset/calculator')

function get(req: HttpRequestParams): Response {
  const scopeCode: string | undefined = req.params?.scopeCode || '2'
  const productGroup: string | undefined = req.params?.productGroup || 'SITCT'
  const startValue: string | undefined = req.params?.startValue
  const startMonth: string | undefined = req.params?.startMonth || ''
  const startYear: string | undefined = req.params?.startYear
  const endMonth: string | undefined = req.params?.endMonth || ''
  const endYear: string | undefined = req.params?.endYear
  const language: string | undefined = req.params?.language ? req.params.language : 'nb'
  const errorValidateStartMonth: string = i18nLib.localize({
    key: 'pifServiceValidateStartMonth',
    locale: language
  })
  const errorValidateEndMonth: string = i18nLib.localize({
    key: 'pifServiceValidateEndMonth',
    locale: language
  })

  if (!scopeCode || !startValue || !productGroup || !startMonth || !startYear || !endMonth || !endYear) {
    return {
      status: 400,
      body: {
        error: 'missing parameter'
      },
      contentType: 'application/json'
    }
  }

  const config: Content<CalculatorConfig> | undefined = getCalculatorConfig()

  if (config && config.data.pifSource) {
    const pifDataset: Dataset | null = getPifDataset(config)
    const start: string = startMonth !== '' ? startYear + 'M' + startMonth : startYear
    const end: string = endMonth !== '' ? endYear + 'M' + endMonth : endYear

    const indexResult: IndexResult = getIndexes(scopeCode, productGroup, start, end, pifDataset)
    // const chronological: boolean = isChronological(startYear, startMonth, endYear, endMonth)
    if (indexResult.startIndex !== null && indexResult.endIndex !== null) {
      // const changeValue: number = getChangeValue(indexResult.startIndex, indexResult.endIndex, chronological)
      return {
        body: {
          startIndex: indexResult.startIndex,
          endIndex: indexResult.endIndex
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
      error: 'missing calculator config or pif sources'
    },
    contentType: 'application/json'
  }
}
exports.get = get

function getIndexes(scopeCode: string, productGroup: string, start: string, end: string, pifData: Dataset | null): IndexResult {
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  const startIndex: null | number = pifData?.Data({
    Tid: start,
    Marked: scopeCode,
    SITC: productGroup
  }).value

  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  const endIndex: null | number = pifData?.Data({
    Tid: end,
    Marked: scopeCode,
    SITC: productGroup
  }).value

  return {
    startIndex,
    endIndex
  }
}

interface IndexResult {
    startIndex: number | null;
    endIndex: number | null;
}
