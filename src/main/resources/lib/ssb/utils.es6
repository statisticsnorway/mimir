const {
  getPhrases
} = __non_webpack_require__( '/lib/language')
const {
  list: listOperationsAlerts
} = __non_webpack_require__( '/lib/ssb/operationsAlert')
const {
  list: listMunicipalityAlerts
} = __non_webpack_require__( '/lib/ssb/municipalityAlert')
const {
  list: listStatisticAlerts
} = __non_webpack_require__( '/lib/ssb/statisticAlert')
const {
  processHtml,
  pageUrl
} = __non_webpack_require__( '/lib/xp/portal')
const content = __non_webpack_require__( '/lib/xp/content')
const {
  render
} = __non_webpack_require__( '/lib/thymeleaf')
const {
  readLines
} = __non_webpack_require__('/lib/xp/io')
const moment = require('moment/min/moment-with-locales')

const errorView = resolve('../error/error.html')

const numberWithSpaces = (x) => {
  const parts = x.toString().split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')
  return parts.join('.')
}

export const createHumanReadableFormat = (value) => {
  return value > 999 ? numberWithSpaces(value).toString().replace(/\./, ',') : value.toString().replace(/\./, ',')
}

export const alertsForContext = (context, options) => {
  return context === `${app.name}:statistics` ? getStatisticAlerts(options) : getMunicipalityAlerts(options)
}

const getStatisticAlerts = (options) => {
  const alerts = [...listOperationsAlerts().hits, ...listStatisticAlerts(options.statisticPageId).hits]
  return alerts.map( (alert) => ({
    title: alert.displayName,
    messageType: alert.type === `${app.name}:operationsAlert` ? 'warning' : 'info',
    message: processHtml({
      value: alert.data.message
    })
  }))
}


const getMunicipalityAlerts = (options) => {
  const municipality = options.municipality
  const municipalPageType = options.municipalPageType
  const currentMunicipalityAlerts = options.municipality ? listMunicipalityAlerts( municipality.code, municipalPageType ) : {
    hits: []
  }
  const alerts = [...listOperationsAlerts().hits, ...currentMunicipalityAlerts.hits]
  return alerts.map( (alert) => ({
    title: alert.displayName,
    messageType: alert.type === `${app.name}:operationsAlert` ? 'warning' : 'info',
    municipalCodes: alert.data.municipalCodes,
    message: processHtml({
      value: alert.data.message
    })
  }))
}

// Returns page mode for Kommunefakta page based on request mode or request path
export const pageMode = (req) => {
  return req.params.municipality ? 'municipality' : 'map'
}

const addBreadcrumbs = (page, visitedPage, breadcrumbs = []) => {
  if (page.type === 'portal:site') {
    breadcrumbs.unshift({
      text: getPhrases(visitedPage).home,
      link: '/'
    })
  } else {
    if (page.type !== 'base:folder') {
      breadcrumbs.unshift({
        text: page.displayName,
        link: pageUrl({
          path: page._path
        })
      })
    }
    const parent = content.get({
      key: page._path.substring(0, page._path.lastIndexOf('/'))
    })

    if (parent) {
      return addBreadcrumbs(parent, visitedPage, breadcrumbs)
    }
  }
  return breadcrumbs
}

export const getBreadcrumbs = (page, municipality) => {
  const breadcrumbs = addBreadcrumbs(page, page)
  if (municipality) {
    breadcrumbs.pop()
    breadcrumbs.push({
      text: municipality.displayName
    })
  } else if (breadcrumbs.length > 0) {
    // remove link of last element in the breadcrumbs list, because its the page we're on
    delete breadcrumbs[breadcrumbs.length - 1].link
  }
  return breadcrumbs
}

export function safeRender(view, model) {
  let response
  try {
    response = {
      body: render(view, model),
      status: 200,
      contentType: 'text/html'
    }
  } catch (e) {
    const errorModel = {
      errorTitle: 'Noe gikk galt',
      errorBody: e
    }
    response = {
      body: render(errorView, errorModel),
      status: 400,
      contentType: 'text/html'
    }
  }

  return response
}

export function pathFromStringOrContent(urlSrc) {
  if (urlSrc !== undefined) {
    if (urlSrc._selected === 'content') {
      const selected = urlSrc[urlSrc._selected]
      return selected && selected.contentId ? pageUrl({
        id: selected.contentId
      }) : undefined
    }

    if (urlSrc._selected === 'manual') {
      const selected = urlSrc[urlSrc._selected]
      return selected && selected.url ? selected.url : undefined
    }
  }

  return undefined
}


export function getImageCaption(imageId) {
  const imageContent = content.get({
    key: imageId
  })
  return imageContent !== undefined ? imageContent.data.caption : ''
}

export function getImageAlt(imageId) {
  const imageContent = content.get({
    key: imageId
  })
  return imageContent !== undefined ? imageContent.data.altText : ''
}



export function isPublished(content) {
  const now = new Date()
  if (content.publish.from) {
    const from = new Date(content.publish.from)
    return from < now
  } else if (content.publish.first) {
    const first = new Date(content.publish.first)
    return first < now
  }
  return false
}

export function isUrl(urlOrId) {
  return urlOrId.indexOf('http') > -1
}

export const dateToFormat = (ds) => moment(ds).locale('nb').format('DD.MM.YYYY HH:mm')
export const dateToReadable = (ds) => moment(ds).locale('nb').fromNow()

/**
 *
 * @param {Object} sourceConfig
 * @return {array} a list of sources, text and url
 */
export const getSources = (sourceConfig) => {
  return sourceConfig.map((selectedSource) => {
    let sourceText
    let sourceUrl

    if (selectedSource._selected == 'urlSource') {
      sourceText = selectedSource.urlSource.urlText
      sourceUrl = selectedSource.urlSource.url
    }

    if (selectedSource._selected == 'relatedSource') {
      sourceText = selectedSource.relatedSource.urlText
      sourceUrl = pageUrl({
        id: selectedSource.relatedSource.sourceSelector
      })
    }
    return {
      urlText: sourceText,
      url: sourceUrl
    }
  })
}

export const getAttachmentContent = (contentId) => {
  if (!contentId) return undefined
  const attachmentContent = content.get({
    key: contentId
  })

  if (!attachmentContent) return undefined
  const stream = content.getAttachmentStream({
    key: attachmentContent._id,
    name: attachmentContent._name
  })

  if (!stream) return undefined
  const lines = readLines(stream)
  return lines[0]
}
