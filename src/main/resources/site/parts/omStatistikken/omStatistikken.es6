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

  const definitionsItems = ['conceptsAndVariables', 'standardRatings']
  const administrativeInformationItems = ['regionalLevel', 'frequency', 'internationalReporting', 'storageAndUse']
  const backgroundItems = ['purposeAndHistory', 'usersAndUse', 'equalTreatmentUsers', 'relationOtherStatistics', 'legalAuthority', 'eeaReference']
  const productionItems = ['scope', 'dataSourcesAndSamples', 'dataCollectionEditingAndCalculations', 'seasonalAdjustment', 'confidentiality', 'comparability']
  const accuracyAndReliabilityItems = ['errorSources', 'revision']
  const aboutSeasonalAdjustmentItems = ['generalInformation', 'whySeasonallyAdjustStatistic', 'preTreatment', 'seasonalAdjustment',
    'auditProcedures', 'qualityOfSeasonalAdjustment', 'specialCases', 'postingProcedures', 'relevantDocumentation']

  const accordions = []
  aboutTheStatisticsContent.data.definition && !isEmpty(aboutTheStatisticsContent.data.definition) ? accordions.push(
    getAccordion('definitions', aboutTheStatisticsContent.data.definition, definitionsItems)) : undefined
  aboutTheStatisticsContent.data.administrativeInformation && !isEmpty(aboutTheStatisticsContent.data.administrativeInformation) ? accordions.push(
    getAccordion('administrativeInformation', aboutTheStatisticsContent.data.administrativeInformation, administrativeInformationItems)) : undefined
  aboutTheStatisticsContent.data.background && !isEmpty(aboutTheStatisticsContent.data.background) ? accordions.push(
    getAccordion('background', aboutTheStatisticsContent.data.background, backgroundItems)) : undefined
  aboutTheStatisticsContent.data.production && !isEmpty(aboutTheStatisticsContent.data.production) ? accordions.push(
    getAccordion('production', aboutTheStatisticsContent.data.production, productionItems)) : undefined
  aboutTheStatisticsContent.data.accuracyAndReliability && !isEmpty(aboutTheStatisticsContent.data.accuracyAndReliability) ? accordions.push(
    getAccordion('accuracyAndReliability', aboutTheStatisticsContent.data.accuracyAndReliability, accuracyAndReliabilityItems)) : undefined

  const relevantDocumentation = {
    body: aboutTheStatisticsContent.data.relevantDocumentation,
    open: i18nLib.localize({
      key: 'relevantDocumentation'
    }),
    items: []
  }

  if (aboutTheStatisticsContent.data.relevantDocumentation) {
    accordions.push(relevantDocumentation)
  }

  aboutTheStatisticsContent.data.aboutSeasonalAdjustment && !isEmpty(aboutTheStatisticsContent.data.aboutSeasonalAdjustment) ? accordions.push(
    getAccordion('aboutSeasonalAdjustment', aboutTheStatisticsContent.data.aboutSeasonalAdjustment, aboutSeasonalAdjustmentItems)) : undefined

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

  function getAccordion(categoryText, category, items) {
    const accordion = {
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

  function isEmpty(obj) {
    return Object.keys(obj).length === 0
  }
}
