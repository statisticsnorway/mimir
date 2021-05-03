const {
  get
} = __non_webpack_require__( '/lib/xp/content')
const {
  getContent, processHtml
} = __non_webpack_require__( '/lib/xp/portal')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const {
  getStatisticByIdFromRepo
} = __non_webpack_require__('/lib/ssb/statreg/statistics')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  getPhrases
} = __non_webpack_require__( '/lib/ssb/utils/language')
const util = __non_webpack_require__('/lib/util')
const {
  getReleaseDatesByVariants
} = __non_webpack_require__('/lib/ssb/statreg/statistics')

const view = resolve('./omStatistikken.html')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const moment = require('moment/min/moment-with-locales')

exports.get = function(req) {
  try {
    const aboutTheStatisticsId = getContent().data.aboutTheStatistics
    return renderPart(req, aboutTheStatisticsId)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req, id) => renderPart(req, [id])

function renderPart(req, aboutTheStatisticsId) {
  const page = getContent()

  moment.locale(page.language ? page.language : 'nb')
  const phrases = getPhrases(page)

  let nextRelease = phrases.notYetDetermined
  const aboutStatisticLabel = phrases.aboutTheStatistics
  const statistic = page.data.statistic && getStatisticByIdFromRepo(page.data.statistic)

  if (statistic) {
    const variants = util.data.forceArray(statistic.variants)
    const releaseDates = getReleaseDatesByVariants(variants)
    const nextReleaseDate = releaseDates.nextRelease[0]

    if (nextReleaseDate && nextReleaseDate !== '') {
      nextRelease = moment(nextReleaseDate).format('D. MMMM YYYY')
    }
  }
  if (page.type === `${app.name}:omStatistikken` && (req.mode === 'edit' || req.mode === 'preview')) {
    // Kun ment for internt bruk, i forhåndsvisning av om-statistikken.
    nextRelease = '<i>Kan kun vises på statistikksiden, ikke i forhåndsvisning av om-statistikken</i>'
  }

  if (!aboutTheStatisticsId) {
    if (req.mode === 'edit' && page.type !== `${app.name}:statistics`) {
      return {
        body: render(view, {
          aboutStatisticLabel
        })
      }
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
    getAccordion('om-statistikken-definisjoner', phrases.definitions, content.definition, items.definition)) : undefined
  isNotEmpty(content.administrativeInformation) ? accordions.push(
    getAccordion('om-statistikken-administrative_opplysninger', phrases.administrativeInformation,
      content.administrativeInformation, items.administrativeInformation)) : undefined
  isNotEmpty(content.background) ? accordions.push(
    getAccordion('om-statistikken-bakgrunn', phrases.background, content.background, items.background)) : undefined
  isNotEmpty(content.production) ? accordions.push(
    getAccordion('om-statistikken-produksjon', phrases.production, content.production, items.production)) : undefined
  isNotEmpty(content.accuracyAndReliability) ? accordions.push(
    getAccordion('om-statistikken-feilkilder', phrases.accuracyAndReliability,
      content.accuracyAndReliability, items.accuracyAndReliability)) : undefined

  const relevantDocumentation = {
    id: 'om-statistikken-relevant-dokumentasjon',
    body: processHtml({
      value: content.relevantDocumentation
    }),
    open: phrases.relevantDocumentation,
    items: []
  }

  if (content.relevantDocumentation) {
    accordions.push(relevantDocumentation)
  }

  isNotEmpty(content.aboutSeasonalAdjustment) ? accordions.push(
    getAccordion('om-sesongjustering', phrases.aboutSeasonalAdjustment, content.aboutSeasonalAdjustment,
      items.aboutSeasonalAdjustment)) : undefined

  if (accordions.length === 0) {
    accordions.push({
      body: 'Feil i lasting av innhold, innhold mangler eller kunne ikke hentes.',
      open: 'Sett inn innhold!',
      items: []
    })
  }

  const props = {
    accordions: accordions
  }

  const omStatistikken = new React4xp('site/parts/accordion/accordion').setProps(props).setId('omStatistikken')
    .uniqueId()

  const model = {
    omStatistikkenId: omStatistikken.react4xpId,
    label: aboutStatisticLabel,
    ingress: content.ingress
  }

  const body = render(view, model)

  return {
    body: omStatistikken.renderBody({
      body: body
    }),
    pageContributions: omStatistikken.renderPageContributions()
  }

  function getAccordion(id, categoryText, category, items) {
    const accordion = {
      id: id,
      body: '',
      open: categoryText,
      items: getItems(category, items)
    }

    return accordion
  }

  function getItems(category, variables) {
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
}
