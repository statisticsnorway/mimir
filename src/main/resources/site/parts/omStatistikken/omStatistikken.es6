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
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = function(req) {
  return renderPart(req)
}

function renderPart(req) {
  const page = getContent()
  const definitionsItems = ['conceptsAndVariables', 'standardRatings']
  const administrativeInformationItems = ['regionalLevel', 'frequency', 'internationalReporting', 'storageAndUse']
  const backgroundItems = ['purposeAndHistory', 'usersAndUse', 'equalTreatmentUsers', 'relationOtherStatistics', 'legalAuthority', 'eeaReference']
  const productionItems = ['scope', 'dataSourcesAndSamples', 'dataCollectionEditingAndCalculations', 'seasonalAdjustment', 'confidentiality', 'comparability']
  const accuracyAndReliabilityItems = ['errorSources', 'revision']
  const aboutSeasonalAdjustmentItems = ['generalInformation', 'whySeasonallyAdjustStatistic', 'preTreatment', 'seasonalAdjustment',
    'auditProcedures', 'qualityOfSeasonalAdjustment', 'specialCases', 'postingProcedures']

  const accordions = []
  page.data.definition && !isEmpty(page.data.definition) ? accordions.push(
    getAccordion('definitions', page.data.definition, definitionsItems)) : undefined
  page.data.administrativeInformation && !isEmpty(page.data.administrativeInformation) ? accordions.push(
    getAccordion('administrativeInformation', page.data.administrativeInformation, administrativeInformationItems)) : undefined
  page.data.background && !isEmpty(page.data.background) ? accordions.push(
    getAccordion('background', page.data.background, backgroundItems)) : undefined
  page.data.production && !isEmpty(page.data.production) ? accordions.push(
    getAccordion('production', page.data.production, productionItems)) : undefined
  page.data.accuracyAndReliability && !isEmpty(page.data.accuracyAndReliability) ? accordions.push(
    getAccordion('accuracyAndReliability', page.data.accuracyAndReliability, accuracyAndReliabilityItems)) : undefined
  page.data.aboutSeasonalAdjustment && !isEmpty(page.data.aboutSeasonalAdjustment) ? accordions.push(
    getAccordion('aboutSeasonalAdjustment', page.data.aboutSeasonalAdjustment, aboutSeasonalAdjustmentItems)) : undefined

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
  const body = render(view, {
    omStatistikkenId: omStatistikken.react4xpId
  })
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
