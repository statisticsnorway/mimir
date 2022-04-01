import { PageContributions, Request, Response } from 'enonic-types/controller'
import { React4xp, React4xpObject, React4xpPageContributionOptions, React4xpResponse } from '../../../lib/types/react4xp'
import { Component } from 'enonic-types/portal'
import { BkibolCalculatorPartConfig } from './bkibolCalculator-part-config'
import { Dataset } from '../../../lib/types/jsonstat-toolkit'
import { Content } from 'enonic-types/content'
import { CalculatorConfig } from '../../content-types/calculatorConfig/calculatorConfig'
import { Language, Phrases } from '../../../lib/types/language'
import { allMonths, nextPeriod } from '../../../lib/ssb/utils/calculatorUtils'
import { CalculatorPeriod } from '../../../lib/types/calculator'
import { ResourceKey } from 'enonic-types/thymeleaf'
import { DropdownItem, DropdownItems } from '../../../lib/types/components'
const {
  getComponent,
  getContent,
  serviceUrl,
  pageUrl
} = __non_webpack_require__( '/lib/xp/portal')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')
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
const view: ResourceKey = resolve('./bkibolCalculator.html') as ResourceKey

exports.get = function(req: Request): React4xpResponse | Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = function( req: Request ) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}


function renderPart(req: Request): React4xpResponse {
  const page: Content<BkibolCalculatorPartConfig> = getContent()
  let bkibolCalculator: CalculatorComponent
  if (req.mode === 'edit') {
    bkibolCalculator = getBkibolCalculatorComponent(page)
  } else {
    bkibolCalculator = fromPartCache(req, `${page._id}-bkibolCalculator`, () => {
      return getBkibolCalculatorComponent(page)
    })
  }

  const pageContributions: string = bkibolCalculator.component.renderPageContributions({})
  return {
    body: bkibolCalculator.body,
    pageContributions
  }
}

function getBkibolCalculatorComponent(page: Content<BkibolCalculatorPartConfig>): CalculatorComponent {
  const part: Component<BkibolCalculatorPartConfig> = getComponent()
  const language: Language = getLanguage(page) as Language
  const phrases: Phrases = language.phrases as Phrases
  const code: string = language.code ? language.code : 'nb'
  const months: DropdownItems = allMonths(phrases)
  const config: Content<CalculatorConfig> | undefined = getCalculatorConfig()
  const bkibolDataEnebolig: Dataset | null = config ? getBkibolDatasetEnebolig(config) : null
  const lastUpdated: CalculatorPeriod = lastPeriod(bkibolDataEnebolig)
  const nextUpdate: CalculatorPeriod = nextPeriod(lastUpdated.month.toString(), lastUpdated.year.toString())
  const nextReleaseMonth: number = +nextUpdate.month
  const nextPublishText: string = i18nLib.localize({
    key: 'calculatorNextPublishText',
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

  const bkibolCalculator: React4xpObject = new React4xp('BkibolCalculator')
    .setProps({
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
    })
    .setId('bkibolCalculatorId')
    .uniqueId()

  const body: string = render(view, {
    bkibolCalculatorId: bkibolCalculator.react4xpId
  })
  return {
    component: bkibolCalculator,
    body: bkibolCalculator.renderBody({
      body
    })
  }
}

function lastPeriod(bkibolData: Dataset | null): CalculatorPeriod {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line new-cap
  const dataYear: string[] = bkibolData ? bkibolData.Dimension('Tid').id as string[] : []
  const lastYear: string = dataYear[dataYear.length - 1]
  return {
    month: +lastYear.substring(5, 2) || 0, // psst: the + casts it as a number. Then return 0 if not castable as number.
    year: +lastYear.substring(0, 4) || 0
  }
}

function monthLabel(months: DropdownItems, language: string, month: number): string {
  const monthLabel: DropdownItem | undefined = months.find((m) => parseInt(m.id) === month)
  if (monthLabel) {
    return language === 'en' ? monthLabel.title : monthLabel.title.toLowerCase()
  }
  return ''
}

interface CalculatorComponent {
  component: React4xpObject;
  body: string;
}
