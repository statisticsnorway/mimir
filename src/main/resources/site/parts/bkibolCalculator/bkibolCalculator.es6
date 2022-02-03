const {
  getComponent,
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
  getCalculatorConfig, getBkibolDatasetEnebolig
} = __non_webpack_require__('/lib/ssb/dataset/calculator')
const i18nLib = __non_webpack_require__('/lib/xp/i18n')
const view = resolve('./bkibolCalculator.html')

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
  let bkibolCalculator
  if (req.mode === 'edit') {
    bkibolCalculator = getBkibolCalculatorComponent(page)
  } else {
    bkibolCalculator = fromPartCache(req, `${page._id}-bkibolCalculator`, () => {
      return getBkibolCalculatorComponent(page)
    })
  }

  const pageContributions = bkibolCalculator.component.renderPageContributions({})
  return {
    body: bkibolCalculator.body,
    pageContributions
  }
}

function getBkibolCalculatorComponent(page) {
  const part = getComponent()
  const language = getLanguage(page)
  const phrases = language.phrases
  const months = allMonths(phrases)
  const config = getCalculatorConfig()
  const bkibolDataEnebolig = getBkibolDatasetEnebolig(config)
  const lastUpdated = lastPeriod(bkibolDataEnebolig)
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
  const calculatorArticleUrl = part.config.bkibolCalculatorArticle && pageUrl({
    id: part.config.bkibolCalculatorArticle
  })

  const bkibolCalculator = new React4xp('BkibolCalculator')
    .setProps({
      bkibolServiceUrl: serviceUrl({
        service: 'bkibol'
      }),
      language: language.code,
      months,
      phrases,
      calculatorArticleUrl,
      nextPublishText,
      lastNumberText,
      lastUpdated
    })
    .setId('bkibolCalculatorId')
    .uniqueId()

  const body = render(view, {
    bkibolCalculatorId: bkibolCalculator.react4xpId
  })
  return {
    component: bkibolCalculator,
    body: bkibolCalculator.renderBody({
      body
    })
  }
}

const lastPeriod = (bkibolData) => {
  // eslint-disable-next-line new-cap
  const dataYear = bkibolData && bkibolData.Dimension('Tid').id
  const lastYear = dataYear[dataYear.length - 1]
  return {
    month: lastYear.substr(5, 2),
    year: lastYear.substr(0, 4)
  }
}

const nextPeriod = (month, year) => {
  let nextPeriodMonth = parseInt(month) + 1
  let nextPeriodYear = parseInt(year)

  if (Number(month) === 12) {
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
