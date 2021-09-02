const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  get: getKeyFigures,
  parseKeyFigure
} = __non_webpack_require__('/lib/ssb/parts/keyFigure')
const {
  getMunicipality
} = __non_webpack_require__('/lib/ssb/dataset/klass/municipalities')
const {
  getContent,
  getComponent,
  getSiteConfig
} = __non_webpack_require__('/lib/xp/portal')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  data
} = __non_webpack_require__('/lib/util')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const {
  DATASET_BRANCH,
  UNPUBLISHED_DATASET_BRANCH
} = __non_webpack_require__('/lib/ssb/repo/dataset')
const {
  hasWritePermissionsAndPreview
} = __non_webpack_require__('/lib/ssb/parts/permissions')

const {
  getPhrases
} = __non_webpack_require__('/lib/ssb/utils/language')
const view = resolve('./keyFigure.html')

exports.get = function(req) {
  try {
    const part = getComponent()
    const keyFigureIds = data.forceArray(part.config.figure)
    const municipality = getMunicipality(req)
    return renderPart(req, municipality, keyFigureIds)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req, id) => {
  const defaultMunicipality = getSiteConfig().defaultMunicipality
  const municipality = getMunicipality({
    code: defaultMunicipality
  })
  return renderPart(req, municipality, [id])
}

const renderPart = (req, municipality, keyFigureIds) => {
  const page = getContent()
  const part = getComponent()
  const showPreviewDraft = hasWritePermissionsAndPreview(req, page._id)

  const phrases = getPhrases(page)

  // get all keyFigures and filter out non-existing keyFigures
  const keyFigures = getKeyFigures(keyFigureIds)
    .map((keyFigure) => {
      const keyFigureData = parseKeyFigure(keyFigure, municipality, DATASET_BRANCH)
      return {
        id: keyFigure._id,
        ...keyFigureData,
        phrases,
        source: keyFigure.data.source
      }
    })

  let keyFiguresDraft
  if (showPreviewDraft) {
    keyFiguresDraft = getKeyFigures(keyFigureIds)
      .map((keyFigure) => {
        const keyFigureData = parseKeyFigure(keyFigure, municipality, UNPUBLISHED_DATASET_BRANCH)
        return {
          id: keyFigure._id,
          ...keyFigureData,
          phrases,
          source: keyFigure.data.source
        }
      })
  }

  // continue if we have any keyFigures
  return keyFigures && keyFigures.length > 0 || draftExist ?
    renderKeyFigure(page, part, phrases, keyFigures, keyFiguresDraft, showPreviewDraft, req) : {
      body: '',
      contentType: 'text/html'
    }
}

function renderKeyFigure(page, part, phrases, parsedKeyFigures, parsedKeyFiguresDraft, showPreviewDraft, req) {
  const draftExist = !!parsedKeyFiguresDraft
  const pageTypeKeyFigure = page.type === `${app.name}:keyFigure`

  const keyFigureReact = new React4xp('KeyFigure')
    .setProps({
      displayName: part && part.config && part.config.title,
      keyFigures: parsedKeyFigures.map((keyFigureData) => {
        return {
          ...keyFigureData,
          glossary: keyFigureData.glossaryText
        }
      }),
      keyFiguresDraft: parsedKeyFiguresDraft ? parsedKeyFiguresDraft.map((keyFigureDraftData) => {
        return {
          ...keyFigureDraftData,
          glossary: keyFigureDraftData.glossaryText
        }
      }) : undefined,
      phrases,
      source: part && part.config && part.config.source,
      columns: part && part.config && part.config.columns,
      showPreviewDraft,
      paramShowDraft: req.params.showDraft,
      draftExist,
      pageTypeKeyFigure
    })
    .uniqueId()

  const hiddenTitle = parsedKeyFigures.map((keyFigureData) => {
    return keyFigureData.title
  })
  const parsedHiddenTitle = hiddenTitle.toString().replace(/[\[\]']+/g, '')

  const body = render(view, {
    keyFiguresId: keyFigureReact.react4xpId,
    hiddenTitle: parsedHiddenTitle
  })

  return {
    body: keyFigureReact.renderBody({
      body,
      clientRender: req.mode !== 'edit'
    }),
    pageContributions: keyFigureReact.renderPageContributions({
      clientRender: req.mode !== 'edit'
    }),
    contentType: 'text/html'
  }
}

