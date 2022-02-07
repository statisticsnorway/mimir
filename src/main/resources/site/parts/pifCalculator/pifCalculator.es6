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
} = __non_webpack_require__( '/lib/ssb/utils/language')
const {
  getCalculatorConfig, getPifDataset
} = __non_webpack_require__('/lib/ssb/dataset/calculator')
const {
  fromPartCache
} = __non_webpack_require__('/lib/ssb/cache/partCache')
const i18nLib = __non_webpack_require__('/lib/xp/i18n')
const view = resolve('./pifCalculator.html')

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
  let pifCalculator
  if (req.mode === 'edit') {
    pifCalculator = getPifCalculatorComponent(page)
  } else {
    pifCalculator = fromPartCache(req, `${page._id}-pifCalculator`, () => {
      return getPifCalculatorComponent(page)
    })
  }

  const pageContributions = pifCalculator.component.renderPageContributions({})
  return {
    body: pifCalculator.body,
    pageContributions
  }
}

function getPifCalculatorComponent(page) {
  const part = getComponent()
  const language = getLanguage(page)
  const phrases = language.phrases
  const months = allMonths(phrases)
  const config = getCalculatorConfig()
  const pifData = getPifDataset(config)
  const lastUpdated = lastPeriod(pifData)
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
  const calculatorArticleUrl = part.config.pifCalculatorArticle && pageUrl({
    id: part.config.pifCalculatorArticle
  })

  const pifCalculator = new React4xp('PifCalculator')
    .setProps({
      pifServiceUrl: serviceUrl({
        service: 'pif'
      }),
      language: language.code,
      months,
      phrases,
      nextPublishText,
      lastNumberText,
      lastUpdated,
      productGroups: productGroups(phrases),
      calculatorArticleUrl
    })
    .setId('pifCalculatorId')
    .uniqueId()

  const body = render(view, {
    pifCalculatorId: pifCalculator.react4xpId
  })
  return {
    component: pifCalculator,
    body: pifCalculator.renderBody({
      body
    })
  }
}

const lastPeriod = (pifData) => {
  // eslint-disable-next-line new-cap
  const dataTime = pifData && pifData.Dimension('Tid').id

  const lastTimeItem = dataTime[dataTime.length - 1]
  const splitTime = lastTimeItem.split('M')

  const lastYear = splitTime[0]
  const lastMonth = splitTime[1]

  return {
    month: lastMonth,
    year: lastYear
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

const monthLabel = (months, language, month) => {
  const monthLabel = months.find((m) => parseInt(m.id) === parseInt(month))
  if (monthLabel) {
    return language === 'en' ? monthLabel.title : monthLabel.title.toLowerCase()
  }
  return ''
}

const allMonths = (phrases) => {
  return [
    {
      id: '',
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

const productGroups = (phrases) => {
  return [
    {
      id: 'SITCT',
      title: phrases.pifProductTypeAll
    },
    {
      id: 'SITC0',
      title: phrases.pifProductFood
    },
    {
      id: 'SITC1',
      title: phrases.pifProductBeverage
    },
    {
      id: 'SITC2',
      title: phrases.pifProductRaw
    },
    {
      id: 'SITC3',
      title: phrases.pifProductFuel
    },
    {
      id: 'SITC4',
      title: phrases.pifProductOil
    },
    {
      id: 'SITC5',
      title: phrases.pifProductChemical
    },
    {
      id: 'SITC6',
      title: phrases.pifProductManufactured
    },
    {
      id: 'SITC7',
      title: phrases.pifProductMachine
    },
    {
      id: 'SITC8',
      title: phrases.pifProductOther
    }
  ]
}
