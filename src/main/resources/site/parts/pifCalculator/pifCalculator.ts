import { type Request, type Response } from '@enonic-types/core'
import { type Content } from '/lib/xp/content'
import { getContent, getComponent, serviceUrl, pageUrl } from '/lib/xp/portal'
import { localize } from '/lib/xp/i18n'
import { type CalculatorPeriod } from '/lib/types/calculator'
import { type DropdownItems as MonthDropdownItems } from '/lib/types/components'
import { type Dataset, type Dimension } from '/lib/types/jsonstat-toolkit'
import { type Phrases } from '/lib/types/language'
import { render } from '/lib/enonic/react4xp'
import { nextPeriod } from '/lib/ssb/utils/calculatorUtils'

import { renderError } from '/lib/ssb/error/error'
import { getLanguage } from '/lib/ssb/utils/language'
import { getCalculatorConfig, getCalculatorDatasetFromSource, PIF_CALCULATOR } from '/lib/ssb/dataset/calculator'
import { fromPartCache } from '/lib/ssb/cache/partCache'
import { type PifCalculatorProps } from '/lib/types/partTypes/pifCalculaor'
import { allMonths, getNextPublishText, monthLabel } from '/lib/ssb/utils/calculatorLocalizationUtils'
import { type CalculatorConfig } from '/site/content-types'

export function get(req: Request): Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: Request) {
  return renderPart(req)
}

function renderPart(req: Request): Response {
  const page = getContent()
  if (!page) throw Error('No page found')

  let pifCalculator: Response
  if (req.mode === 'edit' || req.mode === 'inline') {
    pifCalculator = getPifCalculatorComponent(req, page)
  } else {
    pifCalculator = fromPartCache(req, `${page._id}-pifCalculator`, () => {
      return getPifCalculatorComponent(req, page)
    })
  }

  return pifCalculator
}

function getPifCalculatorComponent(req: Request, page: Content) {
  const partConfig = getComponent<XP.PartComponent.PifCalculator>()?.config
  if (!partConfig) throw Error('No part config found')

  const language = getLanguage(page)
  const phrases = language?.phrases as Phrases
  const months: MonthDropdownItems = allMonths(phrases)
  const config: Content<CalculatorConfig> | undefined = getCalculatorConfig()
  const pifData: Dataset | null = config ? getCalculatorDatasetFromSource(config, PIF_CALCULATOR) : null
  const lastUpdated: CalculatorPeriod | undefined = lastPeriod(pifData) as CalculatorPeriod
  const nextUpdate: CalculatorPeriod = nextPeriod(lastUpdated.month as string, lastUpdated.year as string)
  const nextReleaseMonth: number = (nextUpdate.month as number) === 12 ? 1 : (nextUpdate.month as number) + 1
  const nextPublishText = getNextPublishText({
    language: language?.code,
    months,
    lastUpdatedMonth: lastUpdated?.month as string,
    lastUpdatedYear: lastUpdated?.year as string,
    nextUpdateMonth: nextUpdate.month as string,
    nextReleaseMonth,
  })
  const lastNumberText: string = localize({
    key: 'calculatorLastNumber',
    locale: language?.code,
    values: [monthLabel(months, language?.code, lastUpdated.month as string | number), lastUpdated.year as string],
  })
  const calculatorArticleUrl: string | undefined = partConfig.pifCalculatorArticle
    ? pageUrl({
        id: partConfig.pifCalculatorArticle,
      })
    : undefined

  const props: PifCalculatorProps = {
    pifServiceUrl: serviceUrl({
      service: 'pif',
    }),
    language: language!.code!,
    months,
    phrases,
    nextPublishText,
    lastNumberText,
    lastUpdated,
    productGroups: productGroups(phrases),
    calculatorArticleUrl,
  }

  return render('PifCalculator', props, req, {
    id: 'pifCalculatorId',
    body: '<section class="xp-part part-pif-calculator container"></section>',
  })
}

function lastPeriod(pifData: Dataset | null): CalculatorPeriod | undefined {
  const pifDataDimension: Dimension | null = pifData?.Dimension('Tid') as Dimension
  const dataTime: string | undefined = pifDataDimension?.id as string

  if (dataTime) {
    const lastTimeItem: string = dataTime[dataTime.length - 1]
    const splitTime: Array<string> = lastTimeItem.split('M')

    const lastYear: string = splitTime[0]
    const lastMonth: string = splitTime[1]

    return {
      month: lastMonth,
      year: lastYear,
    }
  }
  return
}

function productGroups(phrases: Phrases): MonthDropdownItems {
  return [
    {
      id: 'SITCT',
      title: phrases.pifProductTypeAll,
    },
    {
      id: 'SITC0',
      title: phrases.pifProductFood,
    },
    {
      id: 'SITC1',
      title: phrases.pifProductBeverage,
    },
    {
      id: 'SITC2',
      title: phrases.pifProductRaw,
    },
    {
      id: 'SITC3',
      title: phrases.pifProductFuel,
    },
    {
      id: 'SITC4',
      title: phrases.pifProductOil,
    },
    {
      id: 'SITC5',
      title: phrases.pifProductChemical,
    },
    {
      id: 'SITC6',
      title: phrases.pifProductManufactured,
    },
    {
      id: 'SITC7',
      title: phrases.pifProductMachine,
    },
    {
      id: 'SITC8',
      title: phrases.pifProductOther,
    },
  ]
}
