const {
  get
} = __non_webpack_require__( '/lib/xp/content')
const {
  getContent
} = __non_webpack_require__( '/lib/xp/portal')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const i18nLib = __non_webpack_require__('/lib/xp/i18n')
const view = resolve('./omStatistikken.html')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')

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
  if (!aboutTheStatisticsId) {
    return {
      body: null
    }
  }

  const aboutTheStatistics = get({
    key: aboutTheStatisticsId
  })

  const data = aboutTheStatistics.data

  const content = {
    definition: data.definition,
    administrativeInformation: data.administrativeInformation,
    background: data.background,
    production: data.production,
    accuracyAndReliability: data.accuracyAndReliability,
    relevantDocumentation: data.relevantDocumentation,
    aboutSeasonalAdjustment: data.aboutSeasonalAdjustment
  }

  const items = {
    definition: ['conceptsAndVariables', 'standardRatings'],
    administrativeInformation: ['regionalLevel', 'frequency', 'internationalReporting', 'storageAndUse'],
    background: ['purposeAndHistory', 'usersAndUse', 'equalTreatmentUsers', 'relationOtherStatistics', 'legalAuthority', 'eeaReference'],
    production: ['scope', 'dataSourcesAndSamples', 'dataCollectionEditingAndCalculations', 'seasonalAdjustment', 'confidentiality', 'comparability'],
    accuracyAndReliability: ['errorSources', 'revision'],
    aboutSeasonalAdjustment: ['generalInformation', 'whySeasonallyAdjustStatistic', 'preTreatment', 'seasonalAdjustment',
      'auditProcedures', 'qualityOfSeasonalAdjustment', 'specialCases', 'postingProcedures', 'relevantDocumentation']
  }

  const accordions = []
  isNotEmpty(content.definition) ? accordions.push(
    getAccordion('om-statistikken-definisjoner', 'definitions', content.definition, items.definition)) : undefined
  isNotEmpty(content.administrativeInformation) ? accordions.push(
    getAccordion('om-statistikken-administrative_opplysninger', 'administrativeInformation',
      content.administrativeInformation, items.administrativeInformation)) : undefined
  isNotEmpty(content.background) ? accordions.push(
    getAccordion('om-statistikken-bakgrunn', 'background', content.background, items.background)) : undefined
  isNotEmpty(content.production) ? accordions.push(
    getAccordion('om-statistikken-produksjon', 'production', content.production, items.production)) : undefined
  isNotEmpty(content.accuracyAndReliability) ? accordions.push(
    getAccordion('om-statistikken-feilkilder', 'accuracyAndReliability', content.accuracyAndReliability, items.accuracyAndReliability)) : undefined

  const relevantDocumentation = {
    id: 'om-statistikken-relevant-dokumentasjon',
    body: content.relevantDocumentation,
    open: i18nLib.localize({
      key: 'relevantDocumentation'
    }),
    items: []
  }

  if (content.relevantDocumentation) {
    accordions.push(relevantDocumentation)
  }

  isNotEmpty(content.aboutSeasonalAdjustment) ? accordions.push(
    getAccordion('om-sesongjustering', 'aboutSeasonalAdjustment', content.aboutSeasonalAdjustment,
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
    label: i18nLib.localize({
      key: 'aboutTheStatistics'
    }),
    ingress: data.ingress
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
      open: i18nLib.localize({
        key: categoryText
      }),
      items: getItems(category, items)
    }

    return accordion
  }

  function getItems(category, variables) {
    const items = []

    if (category) {
      variables.forEach((variable) => {
        const item = {
          title: i18nLib.localize({
            key: variable
          }),
          body: category[variable] ? category[variable] : i18nLib.localize({
            key: 'notRelevant'
          })
        }
        items.push(item)
      }
      )
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
