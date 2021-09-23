const {
  getComponent,
  getContent,
  serviceUrl,
  pageUrl
} = __non_webpack_require__('/lib/xp/portal')
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
const i18nLib = __non_webpack_require__('/lib/xp/i18n')
const {
  fromPartCache
} = __non_webpack_require__('/lib/ssb/cache/partCache')

exports.get = function(req) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req) => renderPart(req)

function renderPart(req) {
  const page = getContent()
  if (req.mode === 'edit') {
    return getHusleiekalkulator(req, page)
  } else {
    return fromPartCache(req, `${page._id}-husleieCalculator`, () => {
      return getHusleiekalkulator(req, page)
    })
  }
}

function getHusleiekalkulator(req, page) {
  const part = getComponent()
  const language = getLanguage(page)
  const phrases = language.phrases
  const config = getCalculatorConfig()
  const kpiDataMonth = getKpiDatasetMonth(config)
  const months = allMonths(phrases)
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
  const calculatorArticleUrl = part.config.husleieCalculatorArticle && pageUrl({
    id: part.config.husleieCalculatorArticle
  })

  const husleieCalculator = new React4xp('site/parts/husleieCalculator/husleieCalculator')
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
      lastUpdated
    })
    .setId('husleieCalculatorId')
    .uniqueId()


  return {
    body: husleieCalculator.renderBody(),
    pageContributions: husleieCalculator.renderPageContributions({
      clientRender: req.mode !== 'edit'
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

const allMonths = (phrases) => {
  return [
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
