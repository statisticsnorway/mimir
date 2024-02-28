import { get as getContentByKey, type Content } from '/lib/xp/content'
import { getContent, processHtml } from '/lib/xp/portal'
import {
  type ReleaseDatesVariant,
  type StatisticInListing,
  type VariantInListing,
} from '/lib/ssb/dashboard/statreg/types'
import { type Accordion, type AccordionItem } from '/lib/types/components'
import { type Phrases } from '/lib/types/language'
import { render } from '/lib/enonic/react4xp'
import { formatDate } from '/lib/ssb/utils/dateUtils'

import { renderError } from '/lib/ssb/error/error'
import { getStatisticByIdFromRepo, getReleaseDatesByVariants } from '/lib/ssb/statreg/statistics'
import { getPhrases } from '/lib/ssb/utils/language'
import { fromPartCache } from '/lib/ssb/cache/partCache'
import * as util from '/lib/util'
import { AboutTheStatisticsProps, Category, Items } from '/lib/types/partTypes/omStatistikken'
import { type Statistics, type OmStatistikken } from '/site/content-types'

export function get(req: XP.Request): XP.Response {
  try {
    const statisticPage = getContent<Content<Statistics>>()
    if (!statisticPage) throw Error('No page found')

    return renderPart(req, statisticPage.data.aboutTheStatistics)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request, id: string | undefined): XP.Response {
  return renderPart(req, id)
}

function renderPart(req: XP.Request, aboutTheStatisticsId: string | undefined): XP.Response {
  const page = getContent()
  if (!page) throw Error('No page found')

  if (!aboutTheStatisticsId) {
    if (req.mode === 'edit' && page.type !== `${app.name}:statistics`) {
      return render(
        'site/parts/omStatistikken/omStatistikken',
        {
          accordions: [],
          label: 'Om statistikken',
          ingress: '',
        },
        req,
        {
          body: `<section id="om-statistikken" class="xp-part part-om-statistikken container-fluid"></section>`,
          id: 'om-statistikken',
        }
      )
    } else {
      return {
        body: null,
      }
    }
  } else {
    if (req.mode === 'edit' || req.mode === 'inline') {
      return getOmStatistikken(req, page, aboutTheStatisticsId)
    } else {
      return fromPartCache(req, `${page._id}-omStatistikken`, () => {
        return getOmStatistikken(req, page, aboutTheStatisticsId)
      })
    }
  }
}

function getOmStatistikken(req: XP.Request, page: Content<any>, aboutTheStatisticsId: string | undefined): XP.Response {
  const phrases: Phrases = getPhrases(page) as Phrases
  const language: string = page.language === 'en' || page.language === 'nn' ? page.language : 'nb'
  let nextRelease: string = phrases.notYetDetermined
  const statisticPage = getContent<Content<Statistics>>()
  if (!statisticPage) throw Error('No page found')

  const statisticId: string | undefined = statisticPage.data.statistic

  const aboutTheStatisticsContent: Content<OmStatistikken> | null = aboutTheStatisticsId
    ? getContentByKey({
        key: aboutTheStatisticsId,
      })
    : null

  const statistic: StatisticInListing | undefined = statisticId ? getStatisticByIdFromRepo(statisticId) : undefined

  if (statistic) {
    nextRelease = getNextRelease(statistic, nextRelease, language)
  }

  if (page.type === `${app.name}:omStatistikken` && (req.mode === 'edit' || req.mode === 'preview')) {
    // Kun ment for internt bruk, i forhåndsvisning av om-statistikken.
    nextRelease = '<i>Kan kun vises på statistikksiden, ikke i forhåndsvisning av om-statistikken</i>'
  }

  const aboutTheStatisticsData: OmStatistikken | undefined = aboutTheStatisticsContent?.data

  const props: AboutTheStatisticsProps = {
    accordions: aboutTheStatisticsData ? getAccordionData(aboutTheStatisticsData, phrases, nextRelease) : [],
    label: phrases.aboutTheStatistics,
    ingress: aboutTheStatisticsData?.ingress ?? '',
  }

  return render('site/parts/omStatistikken/omStatistikken', props, req, {
    // for now, this needs to be a section, so we get correct spacing between parts
    body: `<section id="om-statistikken" class="xp-part part-om-statistikken container-fluid"></section>`,
    id: 'om-statistikken',
  })
}

function getNextRelease(statistic: StatisticInListing, nextRelease: string, language: string): string {
  const variants: Array<VariantInListing> = statistic.variants ? util.data.forceArray(statistic.variants) : []
  const releaseDates: ReleaseDatesVariant = getReleaseDatesByVariants(variants)
  const nextReleaseDate: string = releaseDates.nextRelease[0]
  const nextReleaseStatistic: string | undefined =
    nextReleaseDate && nextReleaseDate !== '' ? formatDate(nextReleaseDate, 'PPP', language) : undefined

  return nextReleaseStatistic ? nextReleaseStatistic : nextRelease
}

function getAccordionData(content: OmStatistikken, phrases: Phrases, nextUpdate: string): Array<Accordion> {
  const accordions: Array<Accordion> = []

  const items: Items = {
    definition: ['conceptsAndVariables', 'standardRatings'],
    administrativeInformation: [
      'nameAndSubject',
      'nextUpdate',
      'responsibleDept',
      'regionalLevel',
      'frequency',
      'internationalReporting',
      'storageAndUse',
    ],
    background: [
      'purposeAndHistory',
      'usersAndUse',
      'equalTreatmentUsers',
      'relationOtherStatistics',
      'legalAuthority',
      'eeaReference',
    ],
    production: [
      'scope',
      'dataSourcesAndSamples',
      'dataCollectionEditingAndCalculations',
      'seasonalAdjustment',
      'confidentiality',
      'comparability',
    ],
    accuracyAndReliability: ['errorSources', 'revision'],
    aboutSeasonalAdjustment: [
      'generalInformation',
      'whySeasonallyAdjustStatistic',
      'preTreatment',
      'seasonalAdjustment',
      'auditProcedures',
      'qualityOfSeasonalAdjustment',
      'specialCases',
      'postingProcedures',
      'relevantDocumentation',
    ],
  }

  const definition: Category | undefined = content.definition
  const administrativeInformation: Category | undefined = content.administrativeInformation
  const background: Category | undefined = content.background
  const production: Category | undefined = content.production
  const accuracyAndReliability: Category | undefined = content.accuracyAndReliability
  const relevantDocumentation: string | undefined = content.relevantDocumentation
  const aboutSeasonalAdjustment: Category | undefined = content.aboutSeasonalAdjustment

  if (administrativeInformation) {
    administrativeInformation.nextUpdate = nextUpdate
  }

  if (definition && isNotEmpty(definition)) {
    accordions.push(
      getAccordion('om-statistikken-definisjoner', phrases.definitions, definition, items.definition, phrases)
    )
  }

  if (administrativeInformation && isNotEmpty(administrativeInformation)) {
    accordions.push(
      getAccordion(
        'om-statistikken-administrative_opplysninger',
        phrases.administrativeInformation,
        administrativeInformation,
        items.administrativeInformation,
        phrases
      )
    )
  }

  if (background && isNotEmpty(background)) {
    accordions.push(getAccordion('om-statistikken-bakgrunn', phrases.background, background, items.background, phrases))
  }

  if (production && isNotEmpty(production)) {
    accordions.push(
      getAccordion('om-statistikken-produksjon', phrases.production, production, items.production, phrases)
    )
  }

  if (accuracyAndReliability && isNotEmpty(accuracyAndReliability)) {
    accordions.push(
      getAccordion(
        'om-statistikken-feilkilder',
        phrases.accuracyAndReliability,
        accuracyAndReliability,
        items.accuracyAndReliability,
        phrases
      )
    )
  }

  const relevantDocumentationAccordion: Accordion = {
    id: 'om-statistikken-relevant-dokumentasjon',
    body: relevantDocumentation
      ? processHtml({
          value: relevantDocumentation.replace(/&nbsp;/g, ' '),
        })
      : undefined,
    open: phrases.relevantDocumentation,
    items: [],
  }

  if (relevantDocumentation) {
    accordions.push(relevantDocumentationAccordion)
  }

  if (aboutSeasonalAdjustment && isNotEmpty(aboutSeasonalAdjustment)) {
    accordions.push(
      getAccordion(
        'om-sesongjustering',
        phrases.aboutSeasonalAdjustment,
        aboutSeasonalAdjustment,
        items.aboutSeasonalAdjustment,
        phrases
      )
    )
  }

  return accordions
}

function getAccordion(
  id: string,
  categoryText: string,
  category: Category,
  items: Array<string>,
  phrases: Phrases
): Accordion {
  return {
    id: id,
    body: '',
    open: categoryText,
    items: getItems(category, items, phrases),
  }
}

function getItems(category: Category, variables: Array<string>, phrases: Phrases): Array<AccordionItem> {
  return variables.map((variable) => {
    return {
      title: phrases[variable],
      body: category[variable]
        ? processHtml({
            value: category[variable].replace(/&nbsp;/g, ' '),
          })
        : phrases.notRelevant,
    }
  })
}

function isNotEmpty(obj: object | undefined): boolean {
  if (obj) {
    return Object.keys(obj).length > 0
  }
  return false
}
