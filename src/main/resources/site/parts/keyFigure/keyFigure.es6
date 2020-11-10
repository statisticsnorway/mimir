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
const {
  DATASET_BRANCH,
  UNPUBLISHED_DATASET_BRANCH
} = __non_webpack_require__('/lib/repo/dataset')
const {
  hasRole
} = __non_webpack_require__('/lib/xp/auth')

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

  const adminRole = hasRole('system.admin')
  // get all keyFigures and filter out non-existing keyFigures
  const keyFigures = getKeyFigures(keyFigureIds)
    .map((keyFigure) => {
      const keyFigureData = parseKeyFigure(req, keyFigure, municipality, DATASET_BRANCH)
      return {
        id: keyFigure._id,
        ...keyFigureData,
        source: keyFigure.data.source
      }
    })

  let keyFiguresDraft
  if (adminRole && req.mode === 'preview') {
    keyFiguresDraft = getKeyFigures(keyFigureIds)
      .map((keyFigure) => {
        const keyFigureData = parseKeyFigure(req, keyFigure, municipality, UNPUBLISHED_DATASET_BRANCH)
        return {
          id: keyFigure._id,
          ...keyFigureData,
          source: keyFigure.data.source
        }
      })
  }

  const showPreviewDraft = adminRole && req.mode === 'preview'
  const draftExist = keyFiguresDraft && keyFiguresDraft.length > 0
  const pageTypeKeyFigure = page.type === `${app.name}:keyFigure`

  // continue if we have any keyFigures
  return keyFigures && keyFigures.length > 0 || draftExist ?
    renderKeyFigure(keyFigures, part, keyFiguresDraft, showPreviewDraft, req, draftExist, pageTypeKeyFigure) : {
      body: '',
      contentType: 'text/html'
    }
}

function renderKeyFigure(parsedKeyFigures, part, parsedKeyFiguresDraft, showPreviewDraft, req, draftExist, pageTypeKeyFigure) {
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
      keyFiguresDraft: parsedKeyFiguresDraft ? parsedKeyFiguresDraft.map((keyFiguresDraft) => {
        return {
          iconUrl: keyFiguresDraft.iconUrl,
          iconAltText: keyFiguresDraft.iconAltText,
          number: keyFiguresDraft.number,
          numberDescription: keyFiguresDraft.numberDescription,
          noNumberText: keyFiguresDraft.noNumberText,
          size: keyFiguresDraft.size,
          title: keyFiguresDraft.title,
          time: keyFiguresDraft.time,
          changes: keyFiguresDraft.changes,
          glossary: keyFiguresDraft.glossaryText,
          greenBox: keyFiguresDraft.greenBox,
          source: keyFiguresDraft.source
        }
      }) : undefined,
      source: part && part.config && part.config.source || undefined,
      columns: part && part.config && part.config.columns,
      showPreviewDraft,
      paramShowDraft: req.params.showDraft,
      draftExist,
      pageTypeKeyFigure
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

