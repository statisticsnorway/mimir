import { formatDate } from '../../../lib/ssb/utils/dateUtils'
import { Content } from 'enonic-types/content'
import { Request, Response } from 'enonic-types/controller'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { Phrases } from '../../../lib/types/language'
import { Statistics } from '../../content-types/statistics/statistics'
import { OmStatistikken } from '../../content-types/omStatistikken/omStatistikken'
import { ReleaseDatesVariant, StatisticInListing, VariantInListing } from '../../../lib/ssb/dashboard/statreg/types'

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
const util = __non_webpack_require__('/lib/util')
const {
  getReleaseDatesByVariants
} = __non_webpack_require__('/lib/ssb/statreg/statistics')
const {
  fromPartCache
} = __non_webpack_require__('/lib/ssb/cache/partCache')
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp') as React4xp

exports.get = function(req:Request):Response | React4xpResponse {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req:Request):Response | React4xpResponse => renderPart(req)

function renderPart(req:Request) {
  const page: Content<any> = getContent()
  if (page.type === `${app.name}:statistics`) {
    return renderPartStatistic(req, page)
  } else {
    const content: Content<OmStatistikken> = getContent()
    return getOmStatistikken(req, content)
  }
}

function renderPartStatistic(req:Request, page: Content<any> ) {
  if (req.mode === 'edit') {
    return getOmStatistikken(req, page)
  } else {
    return fromPartCache(req, `${page._id}-omStatistikken`, () => {
      return getOmStatistikken(req, page)
    })
  }
}

function getOmStatistikken(req:Request, page: Content<any> ) {
  const phrases: Phrases = getPhrases(page)
  const language: string = page.language === 'en' || page.language === 'nn' ? page.language : 'nb'
  const aboutStatisticLabel: string = phrases.aboutTheStatistics
  let aboutTheStatisticsId: string | undefined
  let nextRelease: string = phrases.notYetDetermined
  let aboutTheStatisticsContent: Content<OmStatistikken> | null
  let statisticId: string | undefined = undefined

  if (page.type === `${app.name}:omStatistikken`) {
    aboutTheStatisticsContent = getContent()
    aboutTheStatisticsId = aboutTheStatisticsContent._id
  } else {
    const statisticPage: Content<Statistics> = getContent()
    statisticId = statisticPage.data.statistic
    aboutTheStatisticsId = statisticPage.data.aboutTheStatistics
    aboutTheStatisticsContent = aboutTheStatisticsId ? get({
      key: aboutTheStatisticsId
    }) : null
  }

  const aboutTheStatisticsData: OmStatistikken | undefined = aboutTheStatisticsContent?.data

  const statistic: StatisticInListing | undefined = statisticId ? getStatisticByIdFromRepo(statisticId) : undefined

  if (statistic) {
    nextRelease = getNextRelease(statistic, nextRelease, language)
  }

  if (page.type === `${app.name}:omStatistikken` && (req.mode === 'edit' || req.mode === 'preview')) {
    // Kun ment for internt bruk, i forhåndsvisning av om-statistikken.
    nextRelease = '<i>Kan kun vises på statistikksiden, ikke i forhåndsvisning av om-statistikken</i>'
  }

  if (!aboutTheStatisticsId) {
    if (req.mode === 'edit' && page.type !== `${app.name}:statistics`) {
      return React4xp.render('site/parts/omStatistikken/omStatistikken', {
        accordions: [],
        label: aboutStatisticLabel,
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
  }

  const accordions: Array<Accordion> = aboutTheStatisticsData ? getAccordionData(aboutTheStatisticsData, phrases, nextRelease) : []

  if (accordions.length === 0) {
    accordions.push({
      id: '',
      body: 'Feil i lasting av innhold, innhold mangler eller kunne ikke hentes.',
      open: 'Sett inn innhold!',
      items: []
    })
  }

  return React4xp.render('site/parts/omStatistikken/omStatistikken', {
    accordions,
    label: aboutStatisticLabel,
    ingress: aboutTheStatisticsData && aboutTheStatisticsData.ingress ? aboutTheStatisticsData.ingress : ''
  }, req, {
    // for now, this needs to be a section, so we get correct spacing between parts
    body: `<section id="om-statistikken" class="xp-part part-om-statistikken container-fluid"></section>`,
    id: 'om-statistikken'
  })
}

function getNextRelease(statistic: StatisticInListing, nextRelease: string, language: string) : string {
  const variants: Array<VariantInListing> = statistic.variants ? util.data.forceArray(statistic.variants) : []
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
  aboutSeasonalAdjustment && isNotEmpty(aboutSeasonalAdjustment) ? accordions.push(
    getAccordion('om-sesongjustering', phrases.aboutSeasonalAdjustment, aboutSeasonalAdjustment,
      items.aboutSeasonalAdjustment, phrases)) : undefined

  const relevantDocumentationAccordion: Accordion = {
    id: 'om-statistikken-relevant-dokumentasjon',
    body: relevantDocumentation ? processHtml({
      value: relevantDocumentation.replace(/&nbsp;/g, ' ')
    }) : undefined,
    open: phrases.relevantDocumentation,
    items: []
  }

  if (relevantDocumentationAccordion) {
    accordions.push(relevantDocumentationAccordion)
  }

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
  const items: Array<AccordionItem> = []

  if (category) {
    variables.forEach((variable) => {
      const item:AccordionItem = {
        title: phrases[variable],
        body: category[variable] ? processHtml({
          value: category[variable].replace(/&nbsp;/g, ' ')
        }) : phrases.notRelevant
      }
      items.push(item)
    })
  }
  return items
}

function isNotEmpty(obj: object | undefined): boolean {
  if (obj) {
    return Object.keys(obj).length > 0
  }
  return false
}

interface Accordion {
  id: string,
  body: string | undefined,
  open: string,
  items: Array<AccordionItem>
}

interface AccordionItem {
  title: string,
  body: string
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

