const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  get: getKeyFigures,
  parseKeyFigure
} = __non_webpack_require__( '/lib/ssb/keyFigure')
const {
  getMunicipality
} = __non_webpack_require__( '/lib/klass/municipalities')
const {
  getContent,
  getComponent,
  getSiteConfig
} = __non_webpack_require__( '/lib/xp/portal')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  data
} = __non_webpack_require__( '/lib/util')
const {
  renderError
} = __non_webpack_require__( '/lib/error/error')

const view = resolve('./keyFigure.html')

exports.get = function(req) {
  try {
    const part = getComponent()
    const keyFigureIds = data.forceArray(part.config.figure)
    const municiaplity = getMunicipality(req)
    return renderPart(req, municiaplity, keyFigureIds)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req, id) => {
  const defaultMuniciaplity = getSiteConfig().defaultMunicipality
  const municiaplity = getMunicipality({
    code: defaultMuniciaplity
  })
  return renderPart(req, municiaplity, [id])
}

const renderPart = (req, municipality, keyFigureIds) => {
  const part = getComponent()
  // get all keyFigures and filter out non-existing keyFigures
  const keyFigures = getKeyFigures(keyFigureIds)
    .map((keyFigure) => {
      const keyFigureData = parseKeyFigure(req, keyFigure, municipality)
      return {
        id: keyFigure._id,
        ...keyFigureData,
        source: keyFigure.data.source
      }
    })

  // continue if we have any keyFigures
  return keyFigures.length ? renderKeyFigure(keyFigures, part) : {
    body: '',
    contentType: 'text/html'
  }
}

/**
 *
 * @param {array} parsedKeyFigures
 * @param {object} part
 * @return {{body: string, contentType: string}}
 */
function renderKeyFigure(parsedKeyFigures, part) {
  const keyFigureReact = new React4xp('KeyFigure')
    .setProps({
      displayName: part ? part.config.title : undefined,
      keyFigures: parsedKeyFigures.map((keyFigure) => {
        return {
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
          greenBox: keyFigure.greenBox,
          source: keyFigure.source
        }
      }),
      source: part && part.config && part.config.source || undefined,
      columns: part && part.config && part.config.columns
    })
    .uniqueId()

  const body = render(view, {
    keyFiguresId: keyFigureReact.react4xpId
  })

  return {
    body: keyFigureReact.renderBody({
      body,
      clientRender: true
    }),
    pageContributions: keyFigureReact.renderPageContributions({
      clientRender: true
    }),
    contentType: 'text/html'
  }
}

