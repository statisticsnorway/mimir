import { getSite, assetUrl } from '/lib/xp/portal'
import { localize } from '/lib/xp/i18n'
import { render } from '/lib/thymeleaf'
import { render as r4xpRender } from '/lib/enonic/react4xp'
import { getLanguage } from '/lib/ssb/utils/language'
import { Language } from '/lib/types/language'

const fourOFourView = resolve('./404.html')
const mainErrorView = resolve('./error.html')
const genericErrorView = resolve('./generic.html')
const { randomUnsafeString } = require('../../lib/ssb/utils/utils')

type Error = {
  request: XP.Request
  status: number
}

export function handle404(err: Error) {
  // getting language from site because 404 page is not connected to any content.
  // So unless we stop setting language via menu and start to set it via site, this will always show as 'nb'
  // TODO: find another way to find and set locale of 404 page
  const page = getSite()!
  const language = getLanguage(page)
  const searchId = 'searchBox-' + randomUnsafeString()

  const fourOFourModel = {
    ...getFourOFourAssets(),
    ...getFourOFourLocalizations(),
    searchBoxId: searchId,
  }
  const fourOFourBody = render(fourOFourView, fourOFourModel)
  return r4xpRender(
    'Search',
    {
      searchText: localize({
        key: 'menuSearch',
      }),
      searchResultPageUrl: 'https://www.ssb.no/sok',
      className: 'show',
    },
    err.request,
    {
      id: searchId,
      body: getMainErrorBody(err.status, fourOFourBody, language),
    }
  )
}

export function handleError(err: Error) {
  try {
    const genericModel = {
      ...getGenericAssets(),
      ...getGenericLocalizations(err.status),
    }
    const genericViewBody = render(genericErrorView, genericModel)

    const page = getSite()!
    const language = getLanguage(page)
    const body = getMainErrorBody(err.status, genericViewBody, language)
    return {
      body,
      contentType: 'text/html',
      postProcess: true,
    }
  } catch (error) {
    // fallback in case of full derp
    return {
      contentType: 'text/html',
      body: `<html><body><h1>Error code "${err.status}" </h1></body></html>`,
    }
  }
}

function getMainErrorBody(status: number, contentHtml: string, language: Language | null) {
  const mainErrorModel = {
    ...getAssets(),
    language,
    pageTitle: status === 404 ? 'Side ikke funnet / Page not found' : 'Siden feilet / Page error',
    bodyClasses: '',
    GA_TRACKING_ID: app.config && app.config.GA_TRACKING_ID ? app.config.GA_TRACKING_ID : null,
    contentHtml,
  }
  const mainErrorBody = render(mainErrorView, mainErrorModel)
  return mainErrorBody
}

function getFourOFourLocalizations() {
  return {
    title: localize({
      key: '404.title',
    }),
    text: localize({
      key: '404.text',
    }),
    goBack: localize({
      key: '404.goBack',
    }),
    frontPage: localize({
      key: '404.frontPage',
    }),
    or: localize({
      key: '404.or',
    }),
    search: localize({
      key: '404.search',
    }),
  }
}

function getGenericLocalizations(status: number) {
  return {
    title: localize({
      key: 'error.title',
    }),
    text:
      localize({
        key: 'error.text1',
      }) +
      ` ${status}` +
      localize({
        key: 'error.text2',
      }),
    goBack: localize({
      key: 'error.goBack',
    }),
    frontPage: localize({
      key: 'error.frontPage',
    }),
    or: localize({
      key: 'error.or',
    }),
  }
}

function getGenericAssets() {
  return {
    logo: assetUrl({
      path: 'SSB_logo_black.svg',
    }),
  }
}

function getFourOFourAssets() {
  return {
    illustration: assetUrl({
      path: 'SSB_404_illustration.svg',
    }),
    logo: assetUrl({
      path: 'SSB_logo_black.svg',
    }),
  }
}

function getAssets() {
  return {
    stylesUrl: assetUrl({
      path: 'styles/bundle.css',
    }),
    jsLibsUrl: assetUrl({
      path: 'js/bundle.js',
    }),
  }
}
