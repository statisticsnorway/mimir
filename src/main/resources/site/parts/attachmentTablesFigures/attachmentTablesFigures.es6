const {
  data: {
    forceArray
  }
} = __non_webpack_require__('/lib/util')
const {
  get
} = __non_webpack_require__('/lib/xp/content')
const {
  getContent
} = __non_webpack_require__('/lib/xp/portal')
const {
  getPhrases
} = __non_webpack_require__('/lib/ssb/utils/language')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const {
  datasetOrUndefined
} = __non_webpack_require__('/lib/ssb/cache/cache')
const {
  fromPartCache
} = __non_webpack_require__('/lib/ssb/cache/partCache')

const tableController = __non_webpack_require__('../table/table')
const highchartController = __non_webpack_require__('../highchart/highchart')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const view = resolve('./attachmentTablesFigures.html')

exports.get = function(req) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req) => renderPart(req)

const renderPart = (req) => {
  const page = getContent()
  if (req.mode !== 'edit') {
    return fromPartCache(req, `${page._id}-attachmentTablesFigures`, () => {
      return getTablesAndFiguresComponent(page, req)
    })
  }
  return getTablesAndFiguresComponent(page, req)
}

function getTablesAndFiguresComponent(page, req) {
  const phrases = getPhrases(page)

  const title = phrases.attachmentTablesFigures

  const attachmentTablesAndFigures = page.data.attachmentTablesFigures ? forceArray(page.data.attachmentTablesFigures) : []
  if (attachmentTablesAndFigures.length === 0) {
    if (req.mode === 'edit' && page.type !== `${app.name}:statistics`) {
      return {
        body: render(view, {
          label: title
        })
      }
    } else {
      return {
        body: null
      }
    }
  }

  const attachmentTableAndFigureView = getTablesAndFigures(attachmentTablesAndFigures, req, phrases)

  const accordionComponent = new React4xp('AttachmentTablesFigures')
    .setProps({
      accordions: attachmentTableAndFigureView.map(({
        id, open, subHeader, body, contentType, props
      }) => {
        return {
          id,
          contentType,
          open,
          subHeader,
          body,
          props
        }
      }),
      freeText: page.data.freeTextAttachmentTablesFigures,
      showAll: phrases.showAll,
      showLess: phrases.showLess
    })
    .setId('accordion')
    .uniqueId()

  const accordionBody = accordionComponent.renderBody({
    body: render(view, {
      title,
      accordionId: accordionComponent.react4xpId
    })
  })

  const accordionPageContributions = accordionComponent.renderPageContributions()
  const pageContributions = getFinalPageContributions(accordionPageContributions, attachmentTableAndFigureView)

  return {
    body: accordionBody,
    pageContributions,
    contentType: 'text/html'
  }
}

const getTablesAndFigures = (attachmentTablesAndFigures, req, phrases) => {
  let figureIndex = 0
  let tableIndex = 0
  return (attachmentTablesAndFigures.length > 0) ?
    attachmentTablesAndFigures
      .filter((tableOrFigure) => !!tableOrFigure)
      .map((id, index) => {
        const content = get({
          key: id
        })
        if (content && content.type === `${app.name}:table`) {
          ++tableIndex
          return getTableReturnObject(content, tableController.getProps(req, id), `${phrases.table} ${tableIndex}`, index)
        } else if (content && content.type === `${app.name}:highchart`) {
          ++figureIndex
          return getFigureReturnObject(content, highchartController.preview(req, id), `${phrases.figure} ${figureIndex}`, index)
        }
      }) : []
}

function getTableReturnObject(content, props, subHeader, index) {
  const datasetFromRepo = datasetOrUndefined(content)
  const title = datasetFromRepo && datasetFromRepo.data.tbml && datasetFromRepo.data.tbml.metadata ?
    datasetFromRepo.data.tbml.metadata.title : content.displayName
  return {
    id: `attachment-table-figure-${index + 1}`,
    contentType: content.type,
    open: typeof(title) === 'string' ? title : title.content,
    subHeader,
    props
  }
}

function getFigureReturnObject(content, preview, subHeader, index) {
  const datasetFromRepo = datasetOrUndefined(content)
  const title = datasetFromRepo && datasetFromRepo.data.tbml && datasetFromRepo.data.tbml.metadata ?
    datasetFromRepo.data.tbml.metadata.title : content.displayName
  return {
    id: `attachment-table-figure-${index + 1}`,
    contentType: content.type,
    open: typeof(title) === 'string' ? title : title.content,
    subHeader,
    body: preview.body,
    pageContributions: preview.pageContributions
  }
}

const getFinalPageContributions = (accordionPageContributions, attachmentTableAndFigure) => {
  const pageContributions = attachmentTableAndFigure.reduce((acc, attachment) => {
    if (attachment.pageContributions && attachment.pageContributions.bodyEnd) {
      acc = acc.concat(attachment.pageContributions.bodyEnd)
    }
    return acc
  }, [])

  if (pageContributions.length > 0) {
    return {
      bodyEnd: [].concat(accordionPageContributions.bodyEnd, pageContributions)
    }
  }
  return accordionPageContributions
}
