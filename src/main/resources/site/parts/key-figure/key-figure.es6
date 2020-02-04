const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  get: getKeyFigure
} = __non_webpack_require__( '/lib/ssb/keyFigure')
const {
  parseGlossaryContent
} = __non_webpack_require__( '/lib/ssb/glossary')
const {
  parseMunicipalityValues, getMunicipality
} = __non_webpack_require__( '/lib/klass/municipalities')
const {
  getComponent, getSiteConfig, getContent, imageUrl
} = __non_webpack_require__( '/lib/xp/portal')
const thymeleaf = __non_webpack_require__('/lib/thymeleaf')
const {
  data
} = __non_webpack_require__( '/lib/util')
const {
  pageMode
} = __non_webpack_require__( '/lib/ssb/utils')
const {
  renderError
} = __non_webpack_require__( '/lib/error/error')

const view = resolve('./key-figure.html')

exports.get = function(req) {
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
}

exports.preview = (req, id) => {
  const defaultMuniciaplity = getSiteConfig().defaultMunicipality
  const municiaplity = getMunicipality({
    code: defaultMuniciaplity
  })
  return renderPart(municiaplity, [id])
}

const renderPart = (municipality, keyFigureIds) => {
  try {
    const part = getComponent()
    const keyFigures = keyFigureIds.map((keyFigureId) => getKeyFigure({
      key: keyFigureId
    }))
    return keyFigures.length && municipality !== undefined ? renderKeyFigure(keyFigures, part, municipality) : {
      body: '',
      contentType: 'text/html'
    }
  } catch (e) {
    log.info(e)
    log.info(e.message)
    return renderError('Feil i part', e)
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
  const glossary = keyFigures.reduce( (result, keyFigure) => {
    const parsedGlossary = parseGlossaryContent( keyFigure.data.glossary )
    if (parsedGlossary) {
      result.push(parsedGlossary)
    }
    return result
  }, [])

  const parsedKeyFigures = keyFigures.map( (keyFigure) => {
    const dataset = parseMunicipalityValues(keyFigure.data.dataquery, municipality)
    return {
      id: keyFigure._id,
      displayName: keyFigure.displayName,
      ...keyFigure.data,
      ...dataset,
      glossary: keyFigure.data.glossary
    }
  })

  const keyFiguresWithNonZeroValue = parsedKeyFigures.filter( (keyFigure) => {
    return keyFigure.value !== null && keyFigure.value !== 0
  })

  const source = part && part.config && part.config.source || undefined

  const model = {
    displayName: part ? part.config.title : undefined,
    data: keyFiguresWithNonZeroValue,
    glossary,
    source
  }

  /** Render react **/
  const reactObjs = model.data.map( (keyfigure) => {
    let iconSrc = ''
    if (keyfigure.icon) {
      iconSrc = imageUrl({
        id: keyfigure.icon,
        scale: 'block(100,100)'
      })
    }

    const reactProps = {
      iconUrl: iconSrc,
      number: keyfigure.valueHumanReadable,
      numberDescription: keyfigure.denomination,
      noNumberText: keyfigure.valueNotFound,
      size: keyfigure.size,
      title: keyfigure.displayName,
      time: keyfigure.time,
      changes: keyfigure.changes
    }

    const keyfigureReact = new React4xp('KeyFigure')
    return keyfigureReact.setId(keyfigure.id).setProps(reactProps)
  })

  let body = thymeleaf.render(view, model)

  reactObjs.forEach((keyfigureReact) => {
    body = keyfigureReact.renderBody({
      body
    })
  })

  return {
    body,
    contentType: 'text/html'
  }
}

