import { getContent, processHtml } from '/lib/xp/portal'
import { get as getContentByKey, type Content } from '/lib/xp/content'
import {
  type ReleaseDatesVariant,
  type StatisticInListing,
  type VariantInListing,
} from '/lib/ssb/dashboard/statreg/types'
import { type Accordion, type AccordionItem } from '/lib/types/components'
import { type Phrases } from '/lib/types/language'
import { formatDate } from '/lib/ssb/utils/dateUtils'
import { getReleaseDatesByVariants, getStatisticByIdFromRepo } from '/lib/ssb/statreg/statistics'
import { getPhrases } from '/lib/ssb/utils/language'
import * as util from '/lib/util'
import { type AboutTheStatisticsProps, type Category, type Items } from '/lib/types/partTypes/omStatistikken'
import { type Statistics, type OmStatistikken } from '/site/content-types'

export function getAboutTheStatisticsProps(
  req: XP.Request,
  page: Content<OmStatistikken>,
  aboutTheStatisticsId: string | undefined
): AboutTheStatisticsProps {
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
  const lastUpdated: string | undefined = formatDate(aboutTheStatisticsContent?.modifiedTime, 'PPP', language)

  return {
    accordions: aboutTheStatisticsData ? getAccordionData(aboutTheStatisticsData, phrases, nextRelease) : [],
    label: phrases.aboutTheStatistics,
    ingress: aboutTheStatisticsData?.ingress ?? '',
    lastUpdatedPhrase: phrases.lastUpdated,
    lastUpdated: lastUpdated ?? '',
  }
}

function getNextRelease(statistic: StatisticInListing, nextRelease: string, language: string): string {
  const variants: Array<VariantInListing> = statistic.variants ? util.data.forceArray(statistic.variants) : []
  const releaseDates: ReleaseDatesVariant = getReleaseDatesByVariants(variants)
  const nextReleaseDate: string = releaseDates.nextRelease[0]
  const nextReleaseStatistic: string | undefined =
    nextReleaseDate && nextReleaseDate !== '' ? formatDate(nextReleaseDate, 'PPP', language) : undefined

  return nextReleaseStatistic ?? nextRelease
}

function getAccordionData(content: OmStatistikken, phrases: Phrases, nextUpdate: string): Array<Accordion> {
  const accordions: Array<Accordion> = []

  const items: Items = {
    definition: ['conceptsAndVariables', 'standardRatings', 'unitOfMeasure'],
    administrativeInformation: [
      'nameAndSubject',
      'nextUpdate',
      'responsibleDept',
      'regionalLevel',
      'frequency',
      'internationalReporting',
      'storageAndUse',
      'qualityAssurance',
    ],
    background: [
      'purposeAndHistory',
      'usersAndUse',
      'equalTreatmentUsers',
      'relationOtherStatistics',
      'legalAuthority',
      'eeaReference',
      'timeCoverage',
    ],
    production: [
      'scope',
      'dataSourcesAndSamples',
      'dataCollectionEditingAndCalculations',
      'seasonalAdjustment',
      'confidentiality',
      'comparability',
      'sectorCoverage',
      'basePeriod',
    ],
    accuracyAndReliability: ['errorSources', 'revision', 'qualityAssessment'],
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
  const items: Array<AccordionItem> = []
  variables.forEach((variable) => {
    //TODO: This check (isNewItem) can be removed when the period in which content producers must enter data in new fields is over.
    if ((isNewItem(variable) && category[variable]) || !isNewItem(variable)) {
      items.push({
        title: phrases[variable],
        body: category[variable]
          ? processHtml({
              value: category[variable].replace(/&nbsp;/g, ' '),
            })
          : phrases.notRelevant,
      })
    }
  })
  return items
}

function isNewItem(variable: string): boolean {
  const newItems: Array<string> = [
    'sectorCoverage',
    'basePeriod',
    'timeCoverage',
    'unitOfMeasure',
    'qualityAssurance',
    'qualityAssessment',
  ]
  return newItems.includes(variable)
}

function isNotEmpty(obj: object | undefined): boolean {
  if (obj) {
    return Object.keys(obj).length > 0
  }
  return false
}
