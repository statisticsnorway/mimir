const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  getContent,
  assetUrl
} = __non_webpack_require__( '/lib/xp/portal')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  getHeaderContent
} = __non_webpack_require__( '/lib/ssb/header')
const {
  getFooterContent
} = __non_webpack_require__( '/lib/ssb/footer')
const {
  getLanguage
} = __non_webpack_require__( '/lib/language')

const fallbackView = resolve('./fallback.html')
const defaultView = resolve('../pages/default/default.html')
const fourOFourView = resolve('./404.html')

exports.handle404 = (err) => {
  try {
    const page = getContent()
    const language = getLanguage(page)
    const stylesUrl = assetUrl({
      path: 'styles/bundle.css'
    })

    const jsLibsUrl = assetUrl({
      path: 'js/bundle.js'
    })

    let body = render(defaultView, {
      preview: {
        body: render(fourOFourView)
      },
      pageTitle: 'Side ikke funnet / Page not found - SSB',
      page,
      language,
      jsLibsUrl,
      stylesUrl,
      configRegions: [],
      showIngress: false,
      bodyClasses: '',
      GA_TRACKING_ID: app.config && app.config.GA_TRACKING_ID ? app.config.GA_TRACKING_ID : null

    })
    let pageContributions

    const headerContent = getHeaderContent(language)
    const headerComponent = new React4xp('Header')
      .setProps({
        ...headerContent
      })
      .setId('header')
    body = headerComponent.renderBody({
      body
    })
    pageContributions = headerComponent.renderPageContributions({
      pageContributions
    })

    const footerContent = getFooterContent(language)
    if (footerContent) {
      const footerComponent = new React4xp('Footer')
        .setProps({
          ...footerContent
        })
        .setId('footer')
      body = footerComponent.renderBody({
        body
      })
      pageContributions = footerComponent.renderPageContributions({
        pageContributions
      })
    }

    return {
      contentType: 'text/html',
      body,
      pageContributions
    }
  } catch (e) {
    return {
      contentType: 'text/html',
      body: render(fallbackView, {
        content: render(fourOFourView)
      })
    }
  }
}
