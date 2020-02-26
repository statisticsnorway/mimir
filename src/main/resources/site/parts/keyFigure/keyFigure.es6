const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  get: getKeyFigure,
  parseKeyFigure
} = __non_webpack_require__( '/lib/ssb/keyFigure')
const {
  getMunicipality
} = __non_webpack_require__( '/lib/klass/municipalities')
const {
  getComponent, getSiteConfig, getContent
} = __non_webpack_require__( '/lib/xp/portal')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  data
} = __non_webpack_require__( '/lib/util')
const {
  pageMode
} = __non_webpack_require__( '/lib/ssb/utils')
const {
  renderError
} = __non_webpack_require__( '/lib/error/error')

const view = resolve('./keyFigure.html')

exports.get = function(req) {
  try {
    const part = getComponent()
    const keyFigureIds = data.forceArray(part.config.figure)
    let municiaplity = getMunicipality(req)
    const page = getContent()
    const mode = pageMode(req, page)
    if (!municiaplity && mode === 'edit') {
      const defaultMuniciaplity = getSiteConfig().defaultMunicipality
      municiaplity = getMunicipality({
        code: defaultMuniciaplity
      })
    }
    return renderPart(municiaplity, keyFigureIds)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req, id) => {
  const defaultMuniciaplity = getSiteConfig().defaultMunicipality
  const municiaplity = getMunicipality({
    code: defaultMuniciaplity
  })
  return renderPart(municiaplity, [id])
}

const renderPart = (municipality, keyFigureIds) => {
  const part = getComponent()
  // get all keyFigures and filter out non-existing keyFigures
  const keyFigures = keyFigureIds.reduce((list, keyFigureId) => {
    const keyFigure = getKeyFigure(keyFigureId)
    if (keyFigure) {
      list.push(keyFigure)
    }
    return list
  }, [])

  // continue if we have any keyFigures
  return keyFigures.length ? renderKeyFigure(keyFigures, part, municipality) : {
    body: '',
    contentType: 'text/html'
  }
}

/**
 *
 * @param {array} keyFigures
 * @param {object} part
 * @param {object} municipality
 * @return {{body: string, contentType: string}}
 */
function renderKeyFigure(keyFigures, part, municipality) {
  const parsedKeyFigures = keyFigures.map( (keyFigure) => {
    const keyFigureData = parseKeyFigure(keyFigure, municipality)
    return {
      id: keyFigure._id,
      ...keyFigureData,
      source: keyFigure.data.source
    }
  })

  const source = part && part.config && part.config.source || undefined

  const model = {
    displayName: part ? part.config.title : undefined,
    keyFigures: parsedKeyFigures,
    source
  }

  /** Render react **/
  const reactObjs = parsedKeyFigures.map((keyFigure) => {
    const reactProps = {
      iconUrl: keyFigure.iconUrl,
      iconAltText: keyFigure.iconAltText,
      number: keyFigure.number,
      numberDescription: keyFigure.numberDescription,
      noNumberText: keyFigure.noNumberText,
      size: keyFigure.size,
      title: keyFigure.title,
      time: keyFigure.time,
      changes: keyFigure.changes,
      glossary: keyFigure.glossaryText,
      greenBox: keyFigure.greenBox
    }

    const keyFigureReact = new React4xp('KeyFigure')
    return keyFigureReact.setId(keyFigure.id).setProps(reactProps)
  })

  let body = render(view, model)
  let pageContributions = undefined

  reactObjs.forEach((keyfigureReact) => {
    body = keyfigureReact.renderBody({
      body
    })
    pageContributions = keyfigureReact.renderPageContributions({
      pageContributions
    })
  })

  return {
    body,
    pageContributions,
    contentType: 'text/html'
  }
}

