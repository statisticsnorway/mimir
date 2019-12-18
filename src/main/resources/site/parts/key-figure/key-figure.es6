import { get as getKeyFigure } from '/lib/mimir/key-figure'
import { get as getGlossary } from '/lib/mimir/glossary'
import { parseMunicipalityValues } from '/lib/municipals'
import { getComponent } from '/lib/xp/portal'
import { render } from '/lib/thymeleaf'
import { getMunicipality } from '/lib/klass'
import { data } from '/lib/util'

const view = resolve('./key-figure.html')

exports.get = function(req) {
  const part = getComponent()
  const keyFigureIds = data.forceArray(part.config.figure || part.config['key-figure'] || '')
  return renderPart(req, keyFigureIds);
}

exports.preview = (req, id) => renderPart(req, [id])

function renderPart(req, keyFigureIds) {
  const part = getComponent()
  const municipality = getMunicipality(req)
  const keyFigures = keyFigureIds.map( (keyFigureId) => getKeyFigure({key: keyFigureId}))
  return keyFigures.length ? renderKeyFigure(keyFigures, part, municipality) : ''
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

  const model = {
    part,
    data: keyFiguresWithNonZeroValue,
    page: { glossary }
  }

  return {
    body: render(view, model),
    contentType: 'text/html'
  }
}

