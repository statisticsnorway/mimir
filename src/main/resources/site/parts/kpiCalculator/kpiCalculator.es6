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
} = __non_webpack_require__('/lib/ssb/error/error')
const React4xp = require('/lib/enonic/react4xp')
const {
  getLanguage
} = __non_webpack_require__( '/lib/ssb/utils/language')
const {
  getCalculatorConfig, getKpiDatasetMonth
} = __non_webpack_require__('/lib/ssb/dataset/calculator')
const i18nLib = __non_webpack_require__('/lib/xp/i18n')
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
  const config = getCalculatorConfig()
  const kpiDataMonth = getKpiDatasetMonth(config)
  const months = allMonths(phrases)
  const lastUpdated = lastPeriod(kpiDataMonth)
  const nextUpdate = nextPeriod(lastUpdated.month, lastUpdated.year)
  const nextReleaseMonth = nextUpdate.month == 12 ? 1 : nextUpdate.month + 1
  const nextPublishText = i18nLib.localize({
    key: 'kpiNextPublishText',
    locale: language.code,
    values: [
      monthLabel(months, lastUpdated.month),
      lastUpdated.year,
      monthLabel(months, nextUpdate.month),
      monthLabel(months, nextReleaseMonth)
    ]
  })
  const calculatorArticleUrl = config && config.data.kpiCalculatorArticle ? pageUrl({
    id: config.data.kpiCalculatorArticle
  }) : null

  const kpiCalculator = new React4xp('KpiCalculator')
    .setProps({
      kpiServiceUrl: serviceUrl({
        service: 'kpi'
      }),
      language: language.code,
      months: months,
      phrases: phrases,
      calculatorArticleUrl,
      nextPublishText: nextPublishText,
      lastUpdated: lastUpdated
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
    pageContributions: kpiCalculator.renderPageContributions({
      clientRender: req.mode !== 'edit'
    })
  }
}

const lastPeriod = (kpiDataMonth) => {
  // eslint-disable-next-line new-cap
  const dataYear = kpiDataMonth ? kpiDataMonth.Dimension('Tid').id : null
  // eslint-disable-next-line new-cap
  const dataMonth = kpiDataMonth ? kpiDataMonth.Dimension('Maaned').id : null
  const lastYear = dataYear[dataYear.length - 1]
  const dataLastYearMnd = []

  dataMonth.forEach(function(month) {
    // eslint-disable-next-line new-cap
    const verdi = kpiDataMonth.Data( {
      'Tid': lastYear,
      'Maaned': month
    } ).value
    if (verdi != null) {
      dataLastYearMnd.push(month)
    }
  })
  const lastMonth = dataLastYearMnd[dataLastYearMnd.length - 1]

  return {
    month: lastMonth,
    year: lastYear
  }
}

const nextPeriod = (month, year) => {
  let nextPeriodMonth = parseInt(month) + 1
  let nextPeriodYear = parseInt(year)

  if (month == 12) {
    nextPeriodMonth = 1
    nextPeriodYear = nextPeriodYear + 1
  }

  return {
    month: nextPeriodMonth,
    year: nextPeriodYear
  }
}

const allMonths = (phrases) => {
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

const monthLabel = (months, month) => {
  const monthLabel = months.find((m) => parseInt(m.id) === parseInt(month))
  return monthLabel ? monthLabel.title.toLowerCase() : ''
}
