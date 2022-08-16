import { render as r4XpRender, RenderResponse } from '/lib/enonic/react4xp'
import { getComponent,
  getContent,
  serviceUrl,
  pageUrl,
  Component } from '/lib/xp/portal'
import { BkibolCalculatorPartConfig } from './bkibolCalculator-part-config'
import { Dataset, Dimension } from '../../../lib/types/jsonstat-toolkit'
import { Content } from '/lib/xp/content'
import { CalculatorConfig } from '../../content-types/calculatorConfig/calculatorConfig'
import { Language, Phrases } from '../../../lib/types/language'
import { allMonths, nextPeriod } from '../../../lib/ssb/utils/calculatorUtils'
import { CalculatorPeriod } from '../../../lib/types/calculator'
import { DropdownItem, DropdownItems } from '../../../lib/types/components'

const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')

const {
  getLanguage
} = __non_webpack_require__( '/lib/ssb/utils/language')
const {
  getCalculatorConfig, getBkibolDatasetEnebolig
} = __non_webpack_require__('/lib/ssb/dataset/calculator')
const {
  fromPartCache
} = __non_webpack_require__('/lib/ssb/cache/partCache')
const i18nLib = __non_webpack_require__('/lib/xp/i18n')

exports.get = function(req: XP.Request): RenderResponse | XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = function(req: XP.Request): RenderResponse | XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}


function renderPart(req: XP.Request): RenderResponse {
  const page: Content<BkibolCalculatorPartConfig> = getContent()
  let bkibolCalculator: RenderResponse
  if (req.mode === 'edit' || req.mode === 'inline') {
    bkibolCalculator = getBkibolCalculatorComponent(req, page)
  } else {
    bkibolCalculator = fromPartCache(req, `${page._id}-bkibolCalculator`, () => {
      return getBkibolCalculatorComponent(req, page)
    })
  }

  return bkibolCalculator
}

function getBkibolCalculatorComponent(req: XP.Request, page: Content<BkibolCalculatorPartConfig>): RenderResponse {
  const part: Component<BkibolCalculatorPartConfig> = getComponent()
  const language: Language = getLanguage(page) as Language
  const phrases: Phrases = language.phrases as Phrases
  const code: string = language.code ? language.code : 'nb'
  const months: DropdownItems = allMonths(phrases)
  const config: Content<CalculatorConfig> | undefined = getCalculatorConfig()
  const bkibolDataEnebolig: Dataset | null = config ? getBkibolDatasetEnebolig(config) : null
  const lastUpdated: CalculatorPeriod = lastPeriod(bkibolDataEnebolig)
  const nextUpdate: CalculatorPeriod = nextPeriod(lastUpdated.month.toString(), lastUpdated.year.toString())
  const nextReleaseMonth: number = +nextUpdate.month === 12 ? 1 : +nextUpdate.month + 1
  const nextPublishText: string = i18nLib.localize({
    key: 'bkibolNextPublishText',
    locale: language.code,
    values: [
      monthLabel(months, code, +lastUpdated.month),
      lastUpdated.year.toString(),
      monthLabel(months, code, +nextUpdate.month),
      monthLabel(months, code, nextReleaseMonth)
    ]
  })
  const lastNumberText: string = i18nLib.localize({
    key: 'calculatorLastNumber',
    locale: code,
    values: [
      monthLabel(months, code, +lastUpdated.month),
      lastUpdated.year.toString()
    ]
  })
  const calculatorArticleUrl: string | undefined = part.config.bkibolCalculatorArticle && pageUrl({
    id: part.config.bkibolCalculatorArticle
  })

  return r4XpRender(
    'BkibolCalculator',
    {
      bkibolServiceUrl: serviceUrl({
        service: 'bkibol'
      }),
      language: language.code,
      months,
      phrases,
      calculatorArticleUrl,
      nextPublishText,
      lastNumberText,
      lastUpdated
    },
    req,
    {
      body: `<section class="xp-part part-bkibol-calculator container"></section>`
    })
}

function lastPeriod(bkibolData: Dataset | null): CalculatorPeriod {
  // eslint-disable-next-line new-cap
  const bkiBolDataDimension: Dimension | null = bkibolData?.Dimension('Tid') as Dimension
  const dataTime: string[] = bkiBolDataDimension ? bkiBolDataDimension.id as string[] : []
  const lastTimeItem: string = dataTime[dataTime.length - 1]
  const splitTime: Array<string> = lastTimeItem.split('M')

  const lastYear: string = splitTime[0]
  const lastMonth: string = splitTime[1]

  return {
    month: lastMonth,
    year: lastYear
  }
}

function monthLabel(months: DropdownItems, language: string, month: number): string {
  const monthLabel: DropdownItem | undefined = months.find((m) => parseInt(m.id) === month)
  if (monthLabel) {
    return language === 'en' ? monthLabel.title : monthLabel.title.toLowerCase()
  }
  return ''
}
