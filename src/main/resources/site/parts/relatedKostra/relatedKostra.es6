const {
  getContent,
  getComponent,
  getSiteConfig,
  processHtml
} = __non_webpack_require__( '/lib/xp/portal')
const {
  getMunicipality
} = __non_webpack_require__( '/lib/klass/municipalities')
const {
  pageMode
} = __non_webpack_require__( '/lib/ssb/utils')
const {
  render
} = __non_webpack_require__( '/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')

const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const view = resolve('./relatedKostra.html')

exports.get = function(req) {
  try {
    let municipality = getMunicipality(req)
    const page = getContent()
    const mode = pageMode(req, page)
    if (!municipality && mode === 'edit') {
      const defaultMunicipality = getSiteConfig().defaultMunicipality
      municipality = getMunicipality({
        code: defaultMunicipality
      })
    }
    return renderPart(req, municipality)
  } catch (e) {
    return renderError(req, 'Error in part: ', e)
  }
}

exports.preview = function(req) {
  const defaultMunicipality = getSiteConfig().defaultMunicipality
  const municipality = getMunicipality({
    code: defaultMunicipality
  })
  return renderPart(req, municipality)
}

function renderPart(req, municipality) {
  if (municipality) {
    const part = getComponent()

    const kostraLink = new React4xp('Link')
      .setProps({
        href: part.config.kostraLink + (municipality.path == null ? '' : municipality.path),
        children: part.config.kostraLinkText,
        linkType: 'profiled',
        hasIcon: true,
        iconType: 'arrowRight'
      })
      .setId('kostraLink')

    const model = {
      title: part.config.title,
      description: processHtml({
        value: part.config.description ? part.config.description.replace(/.&nbsp;/g, ' ') : undefined
      })
    }

    const body = kostraLink.renderBody({
      body: render(view, model)
    })

    return {
      body,
      contentType: 'text/html'
    }
  }
}
