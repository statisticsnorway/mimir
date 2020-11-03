const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  getContent,
  assetUrl
} = __non_webpack_require__( '/lib/xp/portal')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  getLanguage
} = __non_webpack_require__( '/lib/language')
const i18nLib = __non_webpack_require__('/lib/xp/i18n')

const fourOFourView = resolve('./404.html')

exports.handle404 = function(err) {
  const stylesUrl = assetUrl({
    path: 'styles/bundle.css'
  })
  const jsLibsUrl = assetUrl({
    path: 'js/bundle.js'
  })
  const illustration = assetUrl({
    path: 'SSB_404_illustration.svg'
  })

  const title = i18nLib.localize({
    key: '404.title'
  })
  const text = i18nLib.localize({
    key: '404.text'
  })
  const goBack = i18nLib.localize({
    key: '404.goBack'
  })
  const frontPage = i18nLib.localize({
    key: '404.frontPage'
  })
  const or = i18nLib.localize({
    key: '404.or'
  })
  const search = i18nLib.localize({
    key: '404.search'
  })
  const searchText = i18nLib.localize({
    key: 'menuSearch'
  })

  function goToSearchResultPage(value) {
    window.location = `https://ssb.no/sok?sok=${value}`
  }

  const searchComponent = new React4xp('Input')
    .setProps({
      id: 'search_ssb',
      ariaLabel: '',
      searchField: true,
      submitCallback: { goToSearchResultPage },
      placeholder: searchText,
      ariaLabelSearchButton: searchText,
      className: ''
    })
    .setId('searchBox')
    .uniqueId()

  const model = {
    pageTitle: 'Side ikke funnet / Page not found - SSB',
    jsLibsUrl,
    stylesUrl,
    title,
    text,
    goBack,
    frontPage,
    or,
    search,
    illustration,
    configRegions: [],
    showIngress: false,
    bodyClasses: '',
    searchBoxId: searchComponent.react4xpId,
    GA_TRACKING_ID: app.config && app.config.GA_TRACKING_ID ? app.config.GA_TRACKING_ID : null
  }

  const thymeleafRender = render(fourOFourView, model)
  const body = searchComponent.renderBody({
    body: thymeleafRender,
    clientRender: true
  })

  return {
    body,
    pageContributions: searchComponent.renderPageContributions(),
    contentType: 'text/html'
  }
}
