import { formatDate } from '../../../lib/ssb/utils/dateUtils'
import { Content } from 'enonic-types/content'
import { Request, Response } from 'enonic-types/controller'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { Phrases } from '../../../lib/types/language'
import { Statistics } from '../../content-types/statistics/statistics'
import { OmStatistikken } from '../../content-types/omStatistikken/omStatistikken'
import { ReleaseDatesVariant, StatisticInListing, VariantInListing } from '../../../lib/ssb/dashboard/statreg/types'
import { Accordion, AccordionItem } from '../../../lib/types/components'

const {
  get
} = __non_webpack_require__('/lib/xp/content')
const {
  getContent, processHtml
} = __non_webpack_require__('/lib/xp/portal')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const {
  getStatisticByIdFromRepo
} = __non_webpack_require__('/lib/ssb/statreg/statistics')
const {
  getPhrases
} = __non_webpack_require__('/lib/ssb/utils/language')
const {
  getReleaseDatesByVariants
} = __non_webpack_require__('/lib/ssb/statreg/statistics')
const {
  fromPartCache
} = __non_webpack_require__('/lib/ssb/cache/partCache')
const {
  data: {
    forceArray
  }
} = __non_webpack_require__('/lib/util')
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp') as React4xp


exports.get = function(req:Request):Response | React4xpResponse {
  try {
    const statisticPage: Content<Statistics> = getContent()
    return renderPart(req, statisticPage.data.aboutTheStatistics)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: Request, id: string | undefined):Response | React4xpResponse => renderPart(req, id)

function renderPart(req:Request, aboutTheStatisticsId: string | undefined):Response | React4xpResponse {
  const page: Content = getContent()
  if (!aboutTheStatisticsId) {
    if (req.mode === 'edit' && page.type !== `${app.name}:statistics`) {
      return React4xp.render('site/parts/omStatistikken/omStatistikken', {
        accordions: [],
        label: 'Om statistikken',
        ingress: ''
      }, req, {
        body: `<section id="om-statistikken" class="xp-part part-om-statistikken container-fluid"></section>`,
        id: 'om-statistikken'
      })
    } else {
      return {
        body: null
      }
    }
  } else {
    if (req.mode === 'edit') {
      return getOmStatistikken(req, page, aboutTheStatisticsId)
    } else {
      return fromPartCache(req, `${page._id}-omStatistikken`, () => {
        return getOmStatistikken(req, page, aboutTheStatisticsId)
      })
    }
  }
}

function getOmStatistikken(req:Request, page: Content<any>, aboutTheStatisticsId: string | undefined ): Response | React4xpResponse {
  const phrases: Phrases = getPhrases(page) as Phrases
  const language: string = page.language === 'en' || page.language === 'nn' ? page.language : 'nb'
  let nextRelease: string = phrases.notYetDetermined
  const statisticPage: Content<Statistics> = getContent()
  const statisticId: string | undefined = statisticPage.data.statistic

  const aboutTheStatisticsContent: Content<OmStatistikken> | null = aboutTheStatisticsId ? get({
    key: aboutTheStatisticsId
  }) : null

  const statistic: StatisticInListing | undefined = statisticId ? getStatisticByIdFromRepo(statisticId) : undefined

  if (statistic) {
    nextRelease = getNextRelease(statistic, nextRelease, language)
  }

  if (page.type === `${app.name}:omStatistikken` && (req.mode === 'edit' || req.mode === 'preview')) {
    // Kun ment for internt bruk, i forhåndsvisning av om-statistikken.
    nextRelease = '<i>Kan kun vises på statistikksiden, ikke i forhåndsvisning av om-statistikken</i>'
  }

  const aboutTheStatisticsData: OmStatistikken | undefined = aboutTheStatisticsContent?.data

  const props: AboutTheStatisticProps = {
    accordions: aboutTheStatisticsData ? getAccordionData(aboutTheStatisticsData, phrases, nextRelease) : [],
    label: phrases.aboutTheStatistics,
    ingress: aboutTheStatisticsData && aboutTheStatisticsData.ingress ? aboutTheStatisticsData.ingress : ''
  }

  return React4xp.render('site/parts/omStatistikken/omStatistikken', props, req, {
    // for now, this needs to be a section, so we get correct spacing between parts
    body: `<section id="om-statistikken" class="xp-part part-om-statistikken container-fluid"></section>`,
    id: 'om-statistikken'
  })
}

function getNextRelease(statistic: StatisticInListing, nextRelease: string, language: string) : string {
  const variants: Array<VariantInListing> = statistic.variants ? forceArray(statistic.variants) : []
  const releaseDates:ReleaseDatesVariant = getReleaseDatesByVariants(variants)
  const nextReleaseDate: string = releaseDates.nextRelease[0]
  const nextReleaseStatistic: string | undefined = nextReleaseDate && nextReleaseDate !== '' ? formatDate(nextReleaseDate, 'PPP', language) : undefined

  return nextReleaseStatistic ? nextReleaseStatistic : nextRelease
}

function getAccordionData(content: OmStatistikken, phrases: Phrases, nextUpdate: string) : Array<Accordion> {
  const accordions: Array<Accordion> = []

  const items: Items = {
    definition: ['conceptsAndVariables', 'standardRatings'],
    administrativeInformation: ['nameAndSubject', 'nextUpdate', 'responsibleDept', 'regionalLevel', 'frequency', 'internationalReporting', 'storageAndUse'],
    background: ['purposeAndHistory', 'usersAndUse', 'equalTreatmentUsers', 'relationOtherStatistics', 'legalAuthority', 'eeaReference'],
    production: ['scope', 'dataSourcesAndSamples', 'dataCollectionEditingAndCalculations', 'seasonalAdjustment', 'confidentiality', 'comparability'],
    accuracyAndReliability: ['errorSources', 'revision'],
    aboutSeasonalAdjustment: ['generalInformation', 'whySeasonallyAdjustStatistic', 'preTreatment', 'seasonalAdjustment',
      'auditProcedures', 'qualityOfSeasonalAdjustment', 'specialCases', 'postingProcedures', 'relevantDocumentation']
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

  definition && isNotEmpty(definition) ? accordions.push(
    getAccordion('om-statistikken-definisjoner', phrases.definitions, definition, items.definition, phrases)) : undefined
  administrativeInformation && isNotEmpty(administrativeInformation) ? accordions.push(
    getAccordion('om-statistikken-administrative_opplysninger', phrases.administrativeInformation,
      administrativeInformation, items.administrativeInformation, phrases)) : undefined
  background && isNotEmpty(background) ? accordions.push(
    getAccordion('om-statistikken-bakgrunn', phrases.background, background, items.background, phrases)) : undefined
  production && isNotEmpty(production) ? accordions.push(
    getAccordion('om-statistikken-produksjon', phrases.production, production, items.production, phrases)) : undefined
  accuracyAndReliability && isNotEmpty(accuracyAndReliability) ? accordions.push(
    getAccordion('om-statistikken-feilkilder', phrases.accuracyAndReliability,
      accuracyAndReliability, items.accuracyAndReliability, phrases)) : undefined

  const relevantDocumentationAccordion: Accordion = {
    id: 'om-statistikken-relevant-dokumentasjon',
    body: relevantDocumentation ? processHtml({
      value: relevantDocumentation.replace(/&nbsp;/g, ' ')
    }) : undefined,
    open: phrases.relevantDocumentation,
    items: []
  }

  if (relevantDocumentation) {
    accordions.push(relevantDocumentationAccordion)
  }

  aboutSeasonalAdjustment && isNotEmpty(aboutSeasonalAdjustment) ? accordions.push(
    getAccordion('om-sesongjustering', phrases.aboutSeasonalAdjustment, aboutSeasonalAdjustment,
      items.aboutSeasonalAdjustment, phrases)) : undefined

  return accordions
}

function getAccordion(id: string, categoryText: string, category: Category, items: Array<string>, phrases: Phrases): Accordion {
  return {
    id: id,
    body: '',
    open: categoryText,
    items: getItems(category, items, phrases)
  }
}

function getItems(category: Category, variables: Array<string>, phrases: Phrases): Array<AccordionItem> {
  return variables.map((variable) => {
    return {
      title: phrases[variable],
      body: category[variable] ? processHtml({
        value: category[variable].replace(/&nbsp;/g, ' ')
      }) : phrases.notRelevant
    }
  })
}

function isNotEmpty(obj: object | undefined): boolean {
  if (obj) {
    return Object.keys(obj).length > 0
  }
  return false
}

interface Items {
  definition: Array<string>,
  administrativeInformation: Array<string>,
  background: Array<string>,
  production: Array<string>,
  accuracyAndReliability: Array<string>,
  aboutSeasonalAdjustment: Array<string>,
}

interface Category {
  [key: string]: string;
}

interface AboutTheStatisticProps {
  accordions: Array<Accordion>,
  label: string,
  ingress: string
}

