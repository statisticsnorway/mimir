const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  getComponent
} = __non_webpack_require__('/lib/xp/portal')
const {
  get
} = __non_webpack_require__('/lib/xp/content')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const {
  data
} = __non_webpack_require__('/lib/util')
const {
  parseKeyFigure
} = __non_webpack_require__('/lib/ssb/parts/keyFigure')
const {
  DATASET_BRANCH
} = __non_webpack_require__('/lib/ssb/repo/dataset')

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
  const keyFiguresPart = part.config.keyfiguresFrontpage ? data.forceArray(part.config.keyfiguresFrontpage) : []

  const frontpageKeyfigures = keyFiguresPart.length > 0 ? keyFiguresPart.map((keyFigure) => {
    const keyFigureContent = keyFigure.keyfigure ? get({
      key: keyFigure.keyfigure
    }) : undefined

    if (keyFigureContent) {
      const keyFigureData = parseKeyFigure(keyFigureContent, undefined, DATASET_BRANCH)
      return {
        id: keyFigureData._id,
        title: keyFigureData.title,
        urlText: keyFigure.urlText,
        url: keyFigure.url,
        number: keyFigureData.number,
        numberDescription: keyFigureData.numberDescription,
        noNumberText: keyFigureData.noNumberText
      }
    }
  }) : []

  return frontpageKeyfigures && frontpageKeyfigures.length > 0 ? renderFrontpageKeyfigures(req, frontpageKeyfigures) : {
    body: '',
    contentType: 'text/html'
  }
}

function renderFrontpageKeyfigures(req, frontpageKeyfigures) {
  const frontpageKeyfiguresReact = new React4xp('FrontpageKeyfigures')
    .setProps({
      keyFigures: frontpageKeyfigures.map((frontpageKeyfigure) => {
        return {
          ...frontpageKeyfigure
        }
      })
    })
    .uniqueId()

  const body = render(view, {
    frontpageKeyfiguresId: frontpageKeyfiguresReact.react4xpId
  })

  return {
    body: frontpageKeyfiguresReact.renderBody({
      body,
      clientRender: req.mode !== 'edit'
    }),
    pageContributions: frontpageKeyfiguresReact.renderPageContributions({
      clientRender: req.mode !== 'edit'
    }),
    contentType: 'text/html'
  }
}

