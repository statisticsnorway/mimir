import { type Request, type Response } from '@enonic-types/core'
import { getComponent, getContent, serviceUrl, pageUrl } from '/lib/xp/portal'
import { type Content } from '/lib/xp/content'
import { localize } from '/lib/xp/i18n'
import { type Language, type Phrases } from '/lib/types/language'
import { nextPeriod } from '/lib/ssb/utils/calculatorUtils'
import { type CalculatorPeriod } from '/lib/types/calculator'
import { type DropdownItems } from '/lib/types/components'
import { type Dataset, type Dimension } from '/lib/types/jsonstat-toolkit'
import { render as r4XpRender } from '/lib/enonic/react4xp'

import { renderError } from '/lib/ssb/error/error'
import { getLanguage } from '/lib/ssb/utils/language'
import { getCalculatorConfig, getBkibolDatasetEnebolig } from '/lib/ssb/dataset/calculator'
import { fromPartCache } from '/lib/ssb/cache/partCache'
import { type BkibolCalculatorProps } from '/lib/types/partTypes/bkibolCalculator'
import { allMonths, monthLabel } from '/lib/ssb/utils/calculatorLocalizationUtils'
import { type CalculatorConfig } from '/site/content-types'
import { type BkibolCalculator as BkibolCalculatorPartConfig } from '.'

export function get(req: Request): Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: Request): Response {
  return renderPart(req)
}

function renderPart(req: Request) {
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

function getBkibolCalculatorComponent(req: Request, page: Content<BkibolCalculatorPartConfig>) {
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
  const nextUpdate: CalculatorPeriod = nextPeriod(
    (lastUpdated.month as string | number).toString(),
    lastUpdated.year.toString()
  )
  const nextReleaseMonth: number = +(nextUpdate.month as number) === 12 ? 1 : +(nextUpdate.month as number) + 1
  const nextPublishText: string = localize({
    key: 'bkibolNextPublishText',
    locale: language.code,
    values: [
      monthLabel(months, code, +(lastUpdated.month as number)),
      lastUpdated.year.toString(),
      monthLabel(months, code, +(nextUpdate.month as number)),
      monthLabel(months, code, nextReleaseMonth),
    ],
  })
  const lastNumberText: string = localize({
    key: 'calculatorLastNumber',
    locale: code,
    values: [monthLabel(months, code, +(lastUpdated.month as number)), lastUpdated.year.toString()],
  })
  const calculatorArticleUrl: string | undefined =
    part.config.bkibolCalculatorArticle &&
    pageUrl({
      id: part.config.bkibolCalculatorArticle,
    })

  const props: BkibolCalculatorProps = {
    bkibolServiceUrl: serviceUrl({
      service: 'bkibol',
    }),
    language: language.code!,
    months,
    phrases,
    calculatorArticleUrl,
    nextPublishText,
    lastNumberText,
    lastUpdated,
  }

  return r4XpRender('BkibolCalculator', props, req, {
    body: `<section class="xp-part part-bkibol-calculator container"></section>`,
  })
}

function lastPeriod(bkibolData: Dataset | null): CalculatorPeriod {
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
