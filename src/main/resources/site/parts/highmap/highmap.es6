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
  getPhrases
} = __non_webpack_require__('/lib/ssb/utils/language')
const {
  readText
} = __non_webpack_require__('/lib/xp/io')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')

const xmlParser = __.newBean('no.ssb.xp.xmlparser.XmlParser')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')

exports.get = function(req) {
  try {
    const part = getComponent()
    const highmapId = part.config.highmapId
    return renderPart(req, highmapId)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req, highmapId) => {
  try {
    return renderPart(req, highmapId)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

const renderPart = (req, highmapId) => {
  const page = getContent()
  const highmapContent = get({
    key: highmapId
  })

  const mapFile = get({
    key: highmapContent.data.mapFile
  })

  const mapStream = getAttachmentStream({
    key: mapFile._id,
    name: mapFile._name
  })

  const mapResult = mapStream ? JSON.parse(readText(mapStream)) : []
  mapResult.features.forEach((element, index) => {
    if (element.properties.name) {
      // New property, to keep capitalization for display in map
      mapResult.features[index].properties.capitalName = element.properties.name.toUpperCase()
    }
  })

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
          capitalName: name, // Matches map result name
          value: value
        })
      }
    })
  }

  const thresholdSets = highmapContent.data.thresholdSets ? forceArray(highmapContent.data.thresholdSets) : []

  const props = {
    title: highmapContent.displayName,
    subtitle: highmapContent.data.subtitle,
    description: highmapContent.data.description,
    mapFile: mapResult,
    tableData,
    thresholdValues: thresholdSets.length ? thresholdSets.map((t) => t) : [],
    hideTitle: highmapContent.data.hideTitle,
    colorPalette: highmapContent.data.colorPalette,
    numberDecimals: highmapContent.data.numberDecimals,
    heightAspectRatio: highmapContent.data.heightAspectRatio,
    seriesTitle: highmapContent.data.seriesTitle,
    legendTitle: highmapContent.data.legendTitle,
    legendAlign: highmapContent.data.legendAlign,
    footnoteText: highmapContent.data.footnoteText ? forceArray(highmapContent.data.footnoteText) : [],
    phrases: getPhrases(page)
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
