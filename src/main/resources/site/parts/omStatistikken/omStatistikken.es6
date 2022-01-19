import { formatDate } from '../../../lib/ssb/utils/dateUtils'

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
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')

exports.get = function(req) {
  try {
    return renderPart(req, getContent().data.aboutTheStatistics)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req, id) => renderPart(req, id)

function renderPart(req, aboutTheStatisticsId) {
  const page = getContent()
  if (req.mode === 'edit') {
    return getOmStatistikken(req, page, aboutTheStatisticsId)
  } else {
    return fromPartCache(req, `${page._id}-omStatistikken`, () => {
      return getOmStatistikken(req, page, aboutTheStatisticsId)
    })
  }
}

function getOmStatistikken(req, page, aboutTheStatisticsId) {
  const phrases = getPhrases(page)
  const language = page.language === 'en' || page.language === 'nn' ? page.language : 'nb'

  let nextRelease = phrases.notYetDetermined
  const aboutStatisticLabel = phrases.aboutTheStatistics
  const statistic = page.data.statistic && getStatisticByIdFromRepo(page.data.statistic)

  if (statistic) {
    const variants = util.data.forceArray(statistic.variants)
    const releaseDates = getReleaseDatesByVariants(variants)
    const nextReleaseDate = releaseDates.nextRelease[0]

    if (nextReleaseDate && nextReleaseDate !== '') {
      nextRelease = formatDate(nextReleaseDate, 'PPP', language)
    }
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

  const aboutTheStatistics = get({
    key: aboutTheStatisticsId
  })

  const content = aboutTheStatistics.data

  const items = {
    definition: ['conceptsAndVariables', 'standardRatings'],
    administrativeInformation: ['nameAndSubject', 'nextUpdate', 'responsibleDept', 'regionalLevel', 'frequency', 'internationalReporting', 'storageAndUse'],
    background: ['purposeAndHistory', 'usersAndUse', 'equalTreatmentUsers', 'relationOtherStatistics', 'legalAuthority', 'eeaReference'],
    production: ['scope', 'dataSourcesAndSamples', 'dataCollectionEditingAndCalculations', 'seasonalAdjustment', 'confidentiality', 'comparability'],
    accuracyAndReliability: ['errorSources', 'revision'],
    aboutSeasonalAdjustment: ['generalInformation', 'whySeasonallyAdjustStatistic', 'preTreatment', 'seasonalAdjustment',
      'auditProcedures', 'qualityOfSeasonalAdjustment', 'specialCases', 'postingProcedures', 'relevantDocumentation']
  }

  if (content.administrativeInformation) {
    content.administrativeInformation.nextUpdate = nextRelease
  }
  const accordions = []
  isNotEmpty(content.definition) ? accordions.push(
    getAccordion('om-statistikken-definisjoner', phrases.definitions, content.definition, items.definition, phrases)) : undefined
  isNotEmpty(content.administrativeInformation) ? accordions.push(
    getAccordion('om-statistikken-administrative_opplysninger', phrases.administrativeInformation,
      content.administrativeInformation, items.administrativeInformation, phrases)) : undefined
  isNotEmpty(content.background) ? accordions.push(
    getAccordion('om-statistikken-bakgrunn', phrases.background, content.background, items.background, phrases)) : undefined
  isNotEmpty(content.production) ? accordions.push(
    getAccordion('om-statistikken-produksjon', phrases.production, content.production, items.production, phrases)) : undefined
  isNotEmpty(content.accuracyAndReliability) ? accordions.push(
    getAccordion('om-statistikken-feilkilder', phrases.accuracyAndReliability,
      content.accuracyAndReliability, items.accuracyAndReliability, phrases)) : undefined

  const relevantDocumentation = {
    id: 'om-statistikken-relevant-dokumentasjon',
    body: content.relevantDocumentation ? processHtml({
      value: content.relevantDocumentation.replace(/&nbsp;/g, ' ')
    }) : undefined,
    open: phrases.relevantDocumentation,
    items: []
  }

  if (content.relevantDocumentation) {
    accordions.push(relevantDocumentation)
  }

  isNotEmpty(content.aboutSeasonalAdjustment) ? accordions.push(
    getAccordion('om-sesongjustering', phrases.aboutSeasonalAdjustment, content.aboutSeasonalAdjustment,
      items.aboutSeasonalAdjustment, phrases)) : undefined

  if (accordions.length === 0) {
    accordions.push({
      body: 'Feil i lasting av innhold, innhold mangler eller kunne ikke hentes.',
      open: 'Sett inn innhold!',
      items: []
    })
  }

  return React4xp.render('site/parts/omStatistikken/omStatistikken', {
    accordions,
    label: aboutStatisticLabel,
    ingress: content.ingress
  }, req, {
    // for now, this needs to be a section, so we get correct spacing between parts
    body: `<section id="om-statistikken" class="xp-part part-om-statistikken container-fluid"></section>`,
    id: 'om-statistikken'
  })
}

function getAccordion(id, categoryText, category, items, phrases) {
  const accordion = {
    id: id,
    body: '',
    open: categoryText,
    items: getItems(category, items, phrases)
  }

  return accordion
}

function getItems(category, variables, phrases) {
  const items = []

  if (category) {
    variables.forEach((variable) => {
      const item = {
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

function isNotEmpty(obj) {
  if (obj) {
    return Object.keys(obj).length > 0
  }
  return false
}
