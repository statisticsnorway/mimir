const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  getComponent
} = __non_webpack_require__( '/lib/xp/portal')
const {
  render
} = __non_webpack_require__( '/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')
const {
  data
} = __non_webpack_require__( '/lib/util')
const {
  get: getKeyFigures,
  parseKeyFigure
} = __non_webpack_require__( '/lib/ssb/keyFigure')
const {
  DATASET_BRANCH
} = __non_webpack_require__('/lib/repo/dataset')

const view = resolve('./frontpageKeyfigures.html')

exports.get = function(req) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req) => renderPart(req)

function renderPart(req) {
  const part = getComponent()
  const frontpageKeyfigures = data.forceArray(part.config.keyfiguresFrontpage)
  const frontpageKeyfigureIds = frontpageKeyfigures.length > 0 ? frontpageKeyfigures.map((k) => k.keyfigure) : []

  const keyFigures = getKeyFigures(frontpageKeyfigureIds)
    .map((keyFigure) => {
      const keyFigureData = parseKeyFigure(keyFigure, undefined, DATASET_BRANCH)
      return {
        id: keyFigure._id,
        ...keyFigureData
      }
    })

  return keyFigures && keyFigures.length > 0 ? renderFrontpageKeyfigures(keyFigures, part) : {
    body: '',
    contentType: 'text/html'
  }
}

function renderFrontpageKeyfigures(parsedKeyFigures, part) {
  const frontpageKeyfiguresReact = new React4xp('FrontpageKeyfigures')
    .setProps({
      displayName: part ? part.config.title : undefined,
      keyFigures: parsedKeyFigures.map((keyFigureData) => {
        return {
          ...keyFigureData
        }
      })
    })
    .uniqueId()

  log.info('frontpageKeyfiguresReact')
  log.info(JSON.stringify(frontpageKeyfiguresReact, null, 4))

  const body = render(view, {
    frontpageKeyfiguresId: frontpageKeyfiguresReact.react4xpId
  })

  return {
    body: frontpageKeyfiguresReact.renderBody({
      body,
      clientRender: true
    }),
    pageContributions: frontpageKeyfiguresReact.renderPageContributions({
      clientRender: true
    }),
    contentType: 'text/html'
  }
}

