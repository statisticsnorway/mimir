const {
  data: {
    forceArray
  }
} = __non_webpack_require__('/lib/util')
const {
  get,
  getAttachmentStream
} = __non_webpack_require__('/lib/xp/content')
const {
  getComponent,
  getContent
} = __non_webpack_require__('/lib/xp/portal')
const {
  readText
} = __non_webpack_require__('/lib/xp/io')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')

const i18nLib = __non_webpack_require__('/lib/xp/i18n')
const xmlParser = __.newBean('no.ssb.xp.xmlparser.XmlParser')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')

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
  const part = getComponent()
  const language = page.language ? page.language === 'en' ? 'en-gb' : page.language : 'nb'

  const highmapContent = get({
    key: part.config.highmapId
  })
  log.info('highmap content %s', JSON.stringify(highmapContent, null, 2))

  const mapFile = get({
    key: highmapContent.data.mapFile
  })
  log.info('highmap attachment id %s', JSON.stringify(highmapContent.data.mapFile, null, 2))
  log.info('map file content %s', JSON.stringify(mapFile, null, 2))

  const mapStream = getAttachmentStream({
    key: mapFile._id,
    name: mapFile._name
  })

  const mapResult = mapStream ? JSON.parse(readText(mapStream)) : {}

  const tableData = []
  if (highmapContent.data.htmlTable) {
    const stringJson = highmapContent.data.htmlTable ? __.toNativeObject(xmlParser.parse(highmapContent.data.htmlTable)) : undefined
    const result = stringJson ? JSON.parse(stringJson) : undefined
    const tableRow = result ? result.table.tbody.tr : undefined
    tableRow.map((row) => {
      if (row) {
        const name = getRowValue(row.td[0])
        const value = getRowValue(row.td[1])
        tableData.push({
          name: name,
          value: value
        })
      }
    })
  }

  log.info('tableData %s', JSON.stringify(tableData, null, 4))

  // TODO: Add if check for highmapContent
  const props = {
    title: highmapContent.displayName,
    subtitle: highmapContent.data.subtitle,
    description: highmapContent.data.description,
    mapFile: mapResult,
    tableData,
    thresholdValues: highmapContent.data.thresholdValues ? forceArray(highmapContent.data.thresholdValues) : [],
    hideTitle: highmapContent.data.hideTitle,
    colorPalette: highmapContent.data.colorPalette,
    numberDecimals: highmapContent.data.numberDecimals,
    heightAspectRatio: highmapContent.data.heightAspectRatio,
    seriesTitle: highmapContent.data.seriesTitle,
    legendTitle: highmapContent.data.legendTitle,
    legendAlign: highmapContent.data.legendAlign,
    footnoteText: highmapContent.data.footnoteText ? forceArray(highmapContent.data.footnoteText) : []
  }

  return React4xp.render('site/parts/highmap/Highmap', props, req)
}

function getRowValue(value) {
  if (typeof value === 'string' && isNumber(value.replace(',', '.'))) {
    return Number(value.replace(',', '.'))
  }
  if (typeof value === 'object') {
    const valueObject = value
    const content = valueObject.content
    if (content) {
      return getRowValue(content)
    }
  }
  return value
}

function isNumber(str) {
  return ((str != null) && (str !== '') && !isNaN(str))
}
