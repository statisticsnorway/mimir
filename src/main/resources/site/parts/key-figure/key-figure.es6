import { get as getKeyFigure } from '/lib/ssb/key-figure'
import { get as getGlossary } from '/lib/ssb/glossary'
import { parseMunicipalityValues, getMunicipality } from '/lib/klass/municipalities'
import { getComponent, getSiteConfig } from '/lib/xp/portal'
import { render } from '/lib/thymeleaf'
import { data } from '/lib/util'

const view = resolve('./key-figure.html')

exports.get = function(req) {
  const part = getComponent()
  const keyFigureIds = data.forceArray(part.config.figure)
  const municiaplity = getMunicipality(req)
  return renderPart(municiaplity, keyFigureIds);
}

exports.preview = (req, id) => {
  const defaultMuniciaplity = getSiteConfig().defaultMunicipality;
  const municiaplity = getMunicipality({code: defaultMuniciaplity})
  return renderPart(municiaplity, [id])
}

const renderPart = (municipality, keyFigureIds) => {
  const part = getComponent()
  const keyFigures = keyFigureIds.map( (keyFigureId) => getKeyFigure({key: keyFigureId}))
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
    return keyFigure.data.glossary ? result.concat(getGlossary({ key: keyFigure.data.glossary })) : result
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
    page: { glossary },
    source
  }

  return {
    body: render(view, model),
    contentType: 'text/html'
  }
}

