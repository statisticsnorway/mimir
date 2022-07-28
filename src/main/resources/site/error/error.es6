import { render } from '/lib/thymeleaf'

const {
  getSite,
  assetUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  getLanguage
} = __non_webpack_require__('/lib/ssb/utils/language')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const i18nLib = __non_webpack_require__('/lib/xp/i18n')

const fourOFourView = resolve('./404.html')
const mainErrorView = resolve('./error.html')
const genericErrorView = resolve('./generic.html')

exports.handle404 = function(err) {
  // getting language from site because 404 page is not connected to any content.
  // So unless we stop setting language via menu and start to set it via site, this will always show as 'nb'
  // TODO: find another way to find and set locale of 404 page
  const page = getSite()
  const language = getLanguage(page)

  const searchComponent = new React4xp('Search')
    .setProps({
      searchText: i18nLib.localize({
        key: 'menuSearch'
      }),
      searchResultPageUrl: 'https://www.ssb.no/sok',
      className: 'show'
    })
    .setId('searchBox')
    .uniqueId()

  const fourOFourModel = {
    ...getFourOFourAssets(),
    ...getFourOFourLocalizations(),
    searchBoxId: searchComponent.react4xpId
  }
  const fourOFourBody = render(fourOFourView, fourOFourModel)

  const body = searchComponent.renderBody({
    body: getMainErrorBody(err.status, fourOFourBody, language),
    clientRender: err.request.mode !== 'edit'
  })

  const pageContributions = searchComponent.renderPageContributions({
    pageContributions,
    clientRender: err.request.mode !== 'edit'
  })

  return {
    body,
    pageContributions,
    contentType: 'text/html',
    postProcess: true
  }
}

exports.handleError = function(err) {
  try {
    const genericModel = {
      ...getGenericAssets(),
      ...getGenericLocalizations(err.status)
    }
    const genericViewBody = render(genericErrorView, genericModel)

    const page = getSite()
    const language = getLanguage(page)
    const body = getMainErrorBody(err.status, genericViewBody, language)
    return {
      body,
      contentType: 'text/html',
      postProcess: true
    }
  } catch (error) {
    // fallback in case of full derp
    return {
      contentType: 'text/html',
      body: `<html><body><h1>Error code "${err.status}" </h1></body></html>`
    }
  }
}

function getMainErrorBody(status, contentHtml, language) {
  const mainErrorModel = {
    ...getAssets(),
    language,
    pageTitle: status === 404 ? 'Side ikke funnet / Page not found' : 'Siden feilet / Page error',
    bodyClasses: '',
    GA_TRACKING_ID: app.config && app.config.GA_TRACKING_ID ? app.config.GA_TRACKING_ID : null,
    contentHtml
  }
  const mainErrorBody = render(mainErrorView, mainErrorModel)
  return mainErrorBody
}

function getFourOFourLocalizations() {
  return {
    title: i18nLib.localize({
      key: '404.title'
    }),
    text: i18nLib.localize({
      key: '404.text'
    }),
    goBack: i18nLib.localize({
      key: '404.goBack'
    }),
    frontPage: i18nLib.localize({
      key: '404.frontPage'
    }),
    or: i18nLib.localize({
      key: '404.or'
    }),
    search: i18nLib.localize({
      key: '404.search'
    })
  }
}

function getGenericLocalizations(status) {
  return {
    title: i18nLib.localize({
      key: 'error.title'
    }),
    text: i18nLib.localize({
      key: 'error.text1'
    }) + ` ${status}` + i18nLib.localize({
      key: 'error.text2'
    }),
    goBack: i18nLib.localize({
      key: 'error.goBack'
    }),
    frontPage: i18nLib.localize({
      key: 'error.frontPage'
    }),
    or: i18nLib.localize({
      key: 'error.or'
    })
  }
}

function getGenericAssets() {
  return {
    logo: assetUrl({
      path: 'SSB_logo_black.svg'
    })
  }
}

function getFourOFourAssets() {
  return {
    illustration: assetUrl({
      path: 'SSB_404_illustration.svg'
    }),
    logo: assetUrl({
      path: 'SSB_logo_black.svg'
    })
  }
}

function getAssets() {
  return {
    stylesUrl: assetUrl({
      path: 'styles/bundle.css'
    }),
    jsLibsUrl: assetUrl({
      path: 'js/bundle.js'
    })
  }
}
