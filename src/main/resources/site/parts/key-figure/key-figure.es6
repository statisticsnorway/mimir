const React4xp = require('/lib/enonic/react4xp');

const { get: getKeyFigure } = __non_webpack_require__( '/lib/mimir/key-figure')
const { get: getGlossary } = __non_webpack_require__( '/lib/mimir/glossary')
const { parseMunicipalityValues } = __non_webpack_require__( '/lib/municipals')
const { getComponent } = __non_webpack_require__( '/lib/xp/portal')
const { render: renderThymeleaf } = __non_webpack_require__( '/lib/thymeleaf')
const { getMunicipality } = __non_webpack_require__( '/lib/klass')
const { data } = __non_webpack_require__( '/lib/util')
const { render : renderReact} = __non_webpack_require__('/lib/enonic/react4xp');

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
  return keyFigures.length ? renderKeyFigure(keyFigures, part, municipality, req) : ''
}

/**
 *
 * @param {array} keyFigures
 * @param {object} part
 * @param {object} municipality
 * @param {object} req
 * @return {{body: string, contentType: string}}
 */
function renderKeyFigure(keyFigures, part, municipality, req) {
  const glossary = keyFigures.reduce( (result, keyFigure) => {
    return keyFigure.data.glossary ? result.concat(getGlossary({ key: keyFigure.data.glossary })) : result
  }, [])

  const parsedKeyFigures = keyFigures.map( (keyFigure) => {
    const dataset = parseMunicipalityValues(keyFigure.data.dataquery, municipality, keyFigure.data.default)

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

  /*** Render thymeleaf **/
  const model = {
    source: {
      title: part ? part.config.title : undefined,
      url: part ? part.config.source : undefined
    },
    data: keyFiguresWithNonZeroValue,
    page: { glossary }
  }

  const thymeleafRender = renderThymeleaf(view, model)

  /** Render react **/
  const component = getComponent()

  const reactObjs = model.data.map( (keyfigure) => {
    const reactProps = {
      number: keyfigure.value,
      title: keyfigure.displayName,
      numberDescription: keyfigure.denomination,
      time: keyfigure.time,
      size: keyfigure.size
      //icon: '{<Home size="240" />}'
    };

    const fig = new React4xp('KeyFigure');
    return fig.setId(keyfigure.id).setProps(reactProps)
  })

  const reactBody = reactObjs.reduce((reactRender, reactObj) => {
    return reactObj.renderBody(reactRender)
  }, thymeleafRender)


  const reactContributions = reactObjs.reduce((reactRender, reactObj) => {
    return reactObj.renderPageContributions(reactRender)
  })

  const clientRender = (req.mode !== 'edit' && req.mode !== 'inline');

  return {
    body: reactBody,
    pageContributions: clientRender ?
      reactContributions :
      undefined
  }

}

