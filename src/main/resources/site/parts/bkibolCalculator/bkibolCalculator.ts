import { render as r4XpRender } from '/lib/enonic/react4xp'
import { getComponent, getContent, serviceUrl, pageUrl } from '/lib/xp/portal'
import type { BkibolCalculator as BkibolCalculatorPartConfig } from '.'
import type { Dataset, Dimension } from '/lib/types/jsonstat-toolkit'
import type { Content } from '/lib/xp/content'
import type { CalculatorConfig } from '/site/content-types'
import type { Language, Phrases } from '/lib/types/language'
import { allMonths, monthLabel, nextPeriod } from '/lib/ssb/utils/calculatorUtils'
import type { CalculatorPeriod } from '/lib/types/calculator'
import type { DropdownItems } from '/lib/types/components'
import { localize } from '/lib/xp/i18n'

const { renderError } = __non_webpack_require__('/lib/ssb/error/error')
const { getLanguage } = __non_webpack_require__('/lib/ssb/utils/language')
const { getCalculatorConfig, getBkibolDatasetEnebolig } = __non_webpack_require__('/lib/ssb/dataset/calculator')
const { fromPartCache } = __non_webpack_require__('/lib/ssb/cache/partCache')

export function get(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request): XP.Response {
  return renderPart(req)
}

function renderPart(req: XP.Request) {
  const page = getContent<Content<BkibolCalculatorPartConfig>>()
  if (!page) throw Error('No page found')

  let bkibolCalculator

  if (req.mode === 'edit' || req.mode === 'inline') {
    bkibolCalculator = getBkibolCalculatorComponent(req, page)
  } else {
    bkibolCalculator = fromPartCache(req, `${page._id}-bkibolCalculator`, () => {
      return getBkibolCalculatorComponent(req, page)
    })
  }

  return bkibolCalculator
}

function getBkibolCalculatorComponent(req: XP.Request, page: Content<BkibolCalculatorPartConfig>) {
  const part = getComponent<XP.PartComponent.BkibolCalculator>()
  if (!part) throw Error('No part found')

  const language: Language = getLanguage(page) as Language
  // Todo - Never pass this to props, this is HUUGE and gets put in html, use localize
  const phrases: Phrases = language.phrases as Phrases
  const code: string = language.code ? language.code : 'nb'
  const months: DropdownItems = allMonths(phrases, false, 'bkibol')
  const config: Content<CalculatorConfig> | undefined = getCalculatorConfig()
  const bkibolDataEnebolig: Dataset | null = config ? getBkibolDatasetEnebolig(config) : null
  const lastUpdated: CalculatorPeriod = lastPeriod(bkibolDataEnebolig)
  const nextUpdate: CalculatorPeriod = nextPeriod(lastUpdated.month.toString(), lastUpdated.year.toString())
  const nextReleaseMonth: number = +nextUpdate.month === 12 ? 1 : +nextUpdate.month + 1
  const nextPublishText: string = localize({
    key: 'bkibolNextPublishText',
    locale: language.code,
    values: [
      monthLabel(months, code, +lastUpdated.month),
      lastUpdated.year.toString(),
      monthLabel(months, code, +nextUpdate.month),
      monthLabel(months, code, nextReleaseMonth),
    ],
  })
  const lastNumberText: string = localize({
    key: 'calculatorLastNumber',
    locale: code,
    values: [monthLabel(months, code, +lastUpdated.month), lastUpdated.year.toString()],
  })
  const calculatorArticleUrl: string | undefined =
    part.config.bkibolCalculatorArticle &&
    pageUrl({
      id: part.config.bkibolCalculatorArticle,
    })

  return r4XpRender(
    'BkibolCalculator',
    {
      bkibolServiceUrl: serviceUrl({
        service: 'bkibol',
      }),
      language: language.code,
      months,
      phrases,
      calculatorArticleUrl,
      nextPublishText,
      lastNumberText,
      lastUpdated,
    },
    req,
    {
      body: `<section class="xp-part part-bkibol-calculator container"></section>`,
    }
  )
}

function lastPeriod(bkibolData: Dataset | null): CalculatorPeriod {
  // eslint-disable-next-line new-cap
  const bkiBolDataDimension: Dimension | null = bkibolData?.Dimension('Tid') as Dimension
  const dataTime: string[] = bkiBolDataDimension ? (bkiBolDataDimension.id as string[]) : []
  const lastTimeItem: string = dataTime[dataTime.length - 1]
  const splitTime: Array<string> = lastTimeItem.split('M')

  const lastYear: string = splitTime[0]
  const lastMonth: string = splitTime[1]

  return {
    month: lastMonth,
    year: lastYear,
  }
}
