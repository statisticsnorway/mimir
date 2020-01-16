const { get: getKeyFigure } = __non_webpack_require__( '/lib/ssb/key-figure')
const { parseGlossaryContent } = __non_webpack_require__( '/lib/ssb/glossary')
const { parseMunicipalityValues, getMunicipality } = __non_webpack_require__( '/lib/klass/municipalities')
const { getComponent, getSiteConfig, getContent } = __non_webpack_require__( '/lib/xp/portal')
const { render } = __non_webpack_require__( '/lib/thymeleaf')
const { data } = __non_webpack_require__( '/lib/util')
const { pageMode } = __non_webpack_require__( '/lib/ssb/utils')

const view = resolve('./key-figure.html')

exports.get = function(req) {
  const part = getComponent()
  const keyFigureIds = data.forceArray(part.config.figure)
  let municiaplity = getMunicipality(req)
  const page = getContent()
  const mode = pageMode(req, page)
  if (!municiaplity && mode === 'edit') {
    const defaultMuniciaplity = getSiteConfig().defaultMunicipality
    municiaplity = getMunicipality({ code: defaultMuniciaplity })
  }
  return renderPart(municiaplity, keyFigureIds)
}

exports.preview = (req, id) => {
  const defaultMuniciaplity = getSiteConfig().defaultMunicipality
  const municiaplity = getMunicipality({ code: defaultMuniciaplity })
  return renderPart(municiaplity, [id])
}

const renderPart = (municipality, keyFigureIds) => {
  const part = getComponent()
  const keyFigures = keyFigureIds.map( (keyFigureId) => getKeyFigure({ key: keyFigureId }))
  return keyFigures.length && municipality !== undefined ? renderKeyFigure(keyFigures, part, municipality) : ''
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
    const dataset = parseMunicipalityValues(keyFigure.data.dataquery, municipality, keyFigure.data.default)
    return {
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

  return {
    body: render(view, model),
    contentType: 'text/html'
  }
}

