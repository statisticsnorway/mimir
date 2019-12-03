import { get as getKeyFigure } from '/lib/mimir/key-figure'
import { get as getGlossary } from '/lib/mimir/glossary'
import { parseMunicipalityValues } from '/lib/municipals'
import { renderError } from '/lib/mimir/error'
import { getComponent } from '/lib/xp/portal'
import { render } from '/lib/thymeleaf'
import { getMunicipality } from '/lib/klass'
import { data } from '/lib/util'

const view = resolve('./key-figure.html')

exports.get = function(req) {
  const part = getComponent() || req
  const municipality = getMunicipality(req)

  const keyFigureIds = data.forceArray(part.config.figure || part.config['key-figure'] || '')
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

  const model = {
    source: {
      title: part ? part.config.title : undefined,
      url: part ? part.config.source : undefined
    },
    data: parsedKeyFigures,
    page: { glossary }
  }

  return {
    body: render(view, model),
    contentType: 'text/html'
  }
}

