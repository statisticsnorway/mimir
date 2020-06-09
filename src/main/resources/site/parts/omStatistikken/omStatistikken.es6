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

  const aboutTheStatisticsContent = get({
    key: aboutTheStatisticsId
  })

  const definitionsContent = aboutTheStatisticsContent.data.definition
  const administrativeInformationContent = aboutTheStatisticsContent.data.administrativeInformation
  const backgroundContent = aboutTheStatisticsContent.data.background
  const productionContent = aboutTheStatisticsContent.data.production
  const accuracyAndReliabilityContent = aboutTheStatisticsContent.data.accuracyAndReliability
  const relevantDocumentationContent = aboutTheStatisticsContent.data.relevantDocumentation
  const aboutSeasonalAdjustmentContent = aboutTheStatisticsContent.data.aboutSeasonalAdjustment

  const definitionsItems = ['conceptsAndVariables', 'standardRatings']
  const administrativeInformationItems = ['regionalLevel', 'frequency', 'internationalReporting', 'storageAndUse']
  const backgroundItems = ['purposeAndHistory', 'usersAndUse', 'equalTreatmentUsers', 'relationOtherStatistics', 'legalAuthority', 'eeaReference']
  const productionItems = ['scope', 'dataSourcesAndSamples', 'dataCollectionEditingAndCalculations', 'seasonalAdjustment', 'confidentiality', 'comparability']
  const accuracyAndReliabilityItems = ['errorSources', 'revision']
  const aboutSeasonalAdjustmentItems = ['generalInformation', 'whySeasonallyAdjustStatistic', 'preTreatment', 'seasonalAdjustment',
    'auditProcedures', 'qualityOfSeasonalAdjustment', 'specialCases', 'postingProcedures', 'relevantDocumentation']

  const accordions = []
  isNotEmpty(definitionsContent) ? accordions.push(
    getAccordion('om-statistikken-definisjoner', 'definitions', definitionsContent, definitionsItems)) : undefined
  isNotEmpty(administrativeInformationContent) ? accordions.push(
    getAccordion('om-statistikken-administrative_opplysninger', 'administrativeInformation',
      administrativeInformationContent, administrativeInformationItems)) : undefined
  isNotEmpty(backgroundContent) ? accordions.push(
    getAccordion('om-statistikken-bakgrunn', 'background', backgroundContent, backgroundItems)) : undefined
  isNotEmpty(productionContent) ? accordions.push(
    getAccordion('om-statistikken-produksjon', 'production', productionContent, productionItems)) : undefined
  isNotEmpty(accuracyAndReliabilityContent) ? accordions.push(
    getAccordion('om-statistikken-feilkilder', 'accuracyAndReliability', accuracyAndReliabilityContent, accuracyAndReliabilityItems)) : undefined

  const relevantDocumentation = {
    id: 'om-statistikken-relevant-dokumentasjon',
    body: relevantDocumentationContent,
    open: i18nLib.localize({
      key: 'relevantDocumentation'
    }),
    items: []
  }

  if (relevantDocumentationContent) {
    accordions.push(relevantDocumentation)
  }

  isNotEmpty(aboutSeasonalAdjustmentContent) ? accordions.push(
    getAccordion('om-sesongjustering', 'aboutSeasonalAdjustment', aboutSeasonalAdjustmentContent,
      aboutSeasonalAdjustmentItems)) : undefined

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
    ingress: aboutTheStatisticsContent.data.ingress
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
