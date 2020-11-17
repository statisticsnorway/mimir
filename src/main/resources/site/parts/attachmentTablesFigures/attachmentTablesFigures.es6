const {
  data: {
    forceArray
  }
} = __non_webpack_require__( '/lib/util')
const {
  concat
} = require('ramda')
const {
  get
} = __non_webpack_require__( '/lib/xp/content')
const {
  getContent
} = __non_webpack_require__('/lib/xp/portal')
const {
  getPhrases
} = __non_webpack_require__( '/lib/language')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')
const {
  datasetOrUndefined
} = __non_webpack_require__('/lib/ssb/cache')


const moment = require('moment/min/moment-with-locales')
const tableController = __non_webpack_require__('../table/table')
const highchartController = __non_webpack_require__('../highchart/highchart')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const view = resolve('./attachmentTablesFigures.html')

exports.get = function(req) {
  //try {
    return renderPart(req)
  /*} catch (e) {
    return renderError(req, 'Error in part', e)
  }*/
}

exports.preview = (req) => renderPart(req)

const renderPart = (req) => {
  const page = getContent()

  moment.locale(page.language ? page.language : 'nb')
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

  const accordionComponent = new React4xp('site/parts/accordion/accordion')
    .setProps({
      accordions: attachmentTableAndFigureView.map(({
        id, open, subHeader, body, items
      }) => {
        return {
          id,
          open,
          subHeader,
          body,
          items
        }
      })
    })
    .setId('accordion')
    .uniqueId()

  const isOutsideContentStudio = (
    req.mode === 'live' || req.mode === 'preview'
  )

  const accordionBody = accordionComponent.renderBody({
    body: render(view, {
      title,
      accordionId: accordionComponent.react4xpId
    }),
    clientRender: isOutsideContentStudio
  })

  const accordionPageContributions = accordionComponent.renderPageContributions({
    clientRender: isOutsideContentStudio
  })

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
    attachmentTablesAndFigures.map((id, index) => {
      const content = get({
        key: id
      })
      if (content && content.type === `${app.name}:table`) {
        ++tableIndex
        return getTableReturnObject(content, tableController.preview(req, id), `${phrases.table} ${tableIndex}`, index)
      } else if (content && content.type === `${app.name}:highchart`) {
        ++figureIndex
        return getFigureReturnObject(content, highchartController.preview(req, id), `${phrases.figure} ${figureIndex}`, index)
      }
    }) : []
}


function getTableReturnObject(content, preview, subHeader, index) {
  const datasetFromRepo = datasetOrUndefined(content)
  log.info('datasetFromRepo.data.tbml')
  log.info(JSON.stringify(datasetFromRepo.data.tbml, null, 2))
  const title = datasetFromRepo && datasetFromRepo.data.tbml.metadata ? datasetFromRepo.data.tbml.metadata.title : content.displayName
  return {
    id: `attachment-table-figure-${index + 1}`,
    open: typeof(title) === 'string' ? title: title.content,
    subHeader,
    body: preview.body,
    items: [],
    pageContributions: preview.pageContributions
  }
}

function getFigureReturnObject(content, preview, subHeader, index) {
  const datasetFromRepo = datasetOrUndefined(content)
  const title = datasetFromRepo && datasetFromRepo.data.tbml.metadata ? datasetFromRepo.data.tbml.metadata.title : content.displayName
  return {
    id: `attachment-table-figure-${index + 1}`,
    open:  typeof(title) === 'string' ? title: title.content,
    subHeader,
    body: preview.body,
    items: [],
    pageContributions: preview.pageContributions
  }
}

const getFinalPageContributions = (accordionPageContributions, attachmentTableAndFigure) => {
  const tablesPageContributions = attachmentTableAndFigure.length > 0 ? attachmentTableAndFigure.map(({
    pageContributions
  }) => {
    return {
      pageContributions
    }
  }) : []

  if (tablesPageContributions.length > 0) {
    const combinedTablesPageContributions = tablesPageContributions.reduce((acc, nextItem) => {
      return acc.concat(acc, nextItem.pageContributions.bodyEnd)
    }, [])

    return {
      bodyEnd: concat(accordionPageContributions.bodyEnd, combinedTablesPageContributions)
    }
  }
  return accordionPageContributions
}
