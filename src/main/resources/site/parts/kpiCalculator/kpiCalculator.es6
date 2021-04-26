const {
  getContent,
  serviceUrl,
  pageUrl
} = __non_webpack_require__( '/lib/xp/portal')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')
const React4xp = require('/lib/enonic/react4xp')
const {
  getLanguage
} = __non_webpack_require__( '/lib/language')
const {
  query
} = __non_webpack_require__('/lib/xp/content')

const view = resolve('./kpiCalculator.html')

exports.get = function(req) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = function(req, id) {
  try {
    return renderPart(req, id)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

function renderPart(req) {
  const page = getContent()
  const language = getLanguage(page)
  const phrases = language.phrases
  const config = query({
    contentTypes: [`${app.name}:calculatorConfig`],
    count: 1,
    start: 0,
    query: ''
  }).hits[0]
  const calculatorArticleUrl = config && config.data.kpiCalculatorArticle ? pageUrl({
    id: config.data.kpiCalculatorArticle
  }): null

  const kpiCalculator = new React4xp('KpiCalculator')
    .setProps({
      kpiServiceUrl: serviceUrl({
        service: 'kpi'
      }),
      language: language.code,
      months: getMonths(phrases),
      phrases: phrases,
      calculatorArticleUrl
    })
    .setId('kpiCalculatorId')
    .uniqueId()

  const body = render(view, {
    kpiCalculatorId: kpiCalculator.react4xpId
  })
  return {
    body: kpiCalculator.renderBody({
      body
    }),
    pageContributions: kpiCalculator.renderPageContributions()
  }
}

const getMonths = (phrases) => {
  return [
    {
      id: '90',
      title: phrases.calculatorMonthAverage
    },
    {
      id: '01',
      title: phrases.january
    },
    {
      id: '02',
      title: phrases.february
    },
    {
      id: '03',
      title: phrases.march
    },
    {
      id: '04',
      title: phrases.april
    },
    {
      id: '05',
      title: phrases.may
    },
    {
      id: '06',
      title: phrases.june
    },
    {
      id: '07',
      title: phrases.july
    },
    {
      id: '08',
      title: phrases.august
    },
    {
      id: '09',
      title: phrases.september
    },
    {
      id: '10',
      title: phrases.october
    },
    {
      id: '11',
      title: phrases.november
    },
    {
      id: '12',
      title: phrases.december
    }
  ]
}
