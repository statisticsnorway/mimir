import { hasPath } from 'ramda'

const {
  getContent,
  serviceUrl
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

  const kpiCalculator = new React4xp('KpiCalculator')
    .setProps({
      kpiServiceUrl: serviceUrl({
        service: 'kpi'
      }),
      language: language,
      months: getMonths(phrases),
      phrasesKpi: getPhrasesKpi(phrases)
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

const getPhrasesKpi = (phrases) => {
  return [
    {
      id: 'calculatorMonthAverage',
      title: phrases.calculatorMonthAverage
    },
    {
      id: 'calculatePriceChange',
      title: phrases.calculatePriceChange
    },
    {
      id: 'enterAmount',
      title: phrases.enterAmount
    },
    {
      id: 'calculatePriceChangeFrom',
      title: phrases.calculatePriceChangeFrom
    },
    {
      id: 'calculatePriceChangeTo',
      title: phrases.calculatePriceChangeTo
    },
    {
      id: 'chooseMonth',
      title: phrases.chooseMonth
    },
    {
      id: 'enterYear',
      title: phrases.enterYear
    },
    {
      id: 'kpiNextPublishText',
      title: phrases.kpiNextPublishText
    }


  ]
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

