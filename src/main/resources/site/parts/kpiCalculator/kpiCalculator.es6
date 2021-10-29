import { GA_TRACKING_ID } from '../../pages/default/default'

const {
  getComponent,
  getContent,
  serviceUrl,
  pageUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  getLanguage
} = __non_webpack_require__('/lib/ssb/utils/language')
const {
  getCalculatorConfig, getKpiDatasetMonth
} = __non_webpack_require__('/lib/ssb/dataset/calculator')
const {
  fromPartCache
} = __non_webpack_require__('/lib/ssb/cache/partCache')
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
  let kpiCalculator
  if (req.mode === 'edit') {
    kpiCalculator = getKpiCalculatorComponent(page)
  } else {
    kpiCalculator = fromPartCache(req, `${page._id}-kpiCalculator`, () => {
      return getKpiCalculatorComponent(page)
    })
  }

  const pageContributions = kpiCalculator.component.renderPageContributions({
    clientRender: req.mode !== 'edit'
  })
  return {
    body: kpiCalculator.body,
    pageContributions
  }
}

const getKpiCalculatorComponent = (page) => {
  const part = getComponent()
  const frontPage = !!part.config.frontPage
  const frontPageIngress = part.config.ingressFrontpage && part.config.ingressFrontpage
  const language = getLanguage(page)
  const phrases = language.phrases
  const config = getCalculatorConfig()
  const kpiDataMonth = getKpiDatasetMonth(config)
  const months = allMonths(phrases, frontPage)
  const lastUpdated = lastPeriod(kpiDataMonth)
  const nextUpdate = nextPeriod(lastUpdated.month, lastUpdated.year)
  const nextReleaseMonth = nextUpdate.month === 12 ? 1 : nextUpdate.month + 1
  const nextPublishText = i18nLib.localize({
    key: 'calculatorNextPublishText',
    locale: language.code,
    values: [
      monthLabel(months, language.code, lastUpdated.month),
      lastUpdated.year,
      monthLabel(months, language.code, nextUpdate.month),
      monthLabel(months, language.code, nextReleaseMonth)
    ]
  })
  const lastNumberText = i18nLib.localize({
    key: 'calculatorLastNumber',
    locale: language.code,
    values: [
      monthLabel(months, language.code, lastUpdated.month),
      lastUpdated.year
    ]
  })
  const calculatorArticleUrl = part.config.kpiCalculatorArticle && pageUrl({
    id: part.config.kpiCalculatorArticle
  })

  const kpiCalculatorComponent = new React4xp('KpiCalculator')
    .setProps({
      kpiServiceUrl: serviceUrl({
        service: 'kpi'
      }),
      language: language.code,
      months,
      phrases,
      calculatorArticleUrl,
      nextPublishText,
      lastNumberText,
      lastUpdated,
      frontPage,
      frontPageIngress,
      GA_TRACKING_ID: GA_TRACKING_ID
    })
    .setId('kpiCalculatorId')
    .uniqueId()
  return {
    component: kpiCalculatorComponent,
    body: kpiCalculatorComponent.renderBody({
      body: render(view, {
        kpiCalculatorId: kpiCalculatorComponent.react4xpId
      })
    })
  }
}

const lastPeriod = (kpiDataMonth) => {
  // eslint-disable-next-line new-cap
  const dataYear = kpiDataMonth && kpiDataMonth.Dimension('Tid').id
  // eslint-disable-next-line new-cap
  const dataMonth = kpiDataMonth && kpiDataMonth.Dimension('Maaned').id
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

  if (month === 12) {
    nextPeriodMonth = 1
    nextPeriodYear = nextPeriodYear + 1
  }

  return {
    month: nextPeriodMonth,
    year: nextPeriodYear
  }
}

const allMonths = (phrases, frontPage) => {
  return [
    {
      id: '90',
      title: frontPage ? phrases.calculatorMonthAverageFrontpage : phrases.calculatorMonthAverage
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

const monthLabel = (months, language, month) => {
  const monthLabel = months.find((m) => parseInt(m.id) === parseInt(month))
  if (monthLabel) {
    return language === 'en' ? monthLabel.title : monthLabel.title.toLowerCase()
  }
  return ''
}
