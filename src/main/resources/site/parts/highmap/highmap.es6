const {
  data
} = __non_webpack_require__('/lib/util')
const {
  get
} = __non_webpack_require__('/lib/xp/content')
const {
  attachmentUrl,
  getComponent,
  getContent,
  processHtml
} = __non_webpack_require__('/lib/xp/portal')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')

const i18nLib = __non_webpack_require__('/lib/xp/i18n')

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

  log.info('highmap content type id %s', JSON.stringify(part.config.highmapId, null, 2))
  const highmapContent = get({
    key: part.config.highmapId
  })

  log.info('highmap attachment name %s', JSON.stringify(highmapContent.data.mapFile, null, 2))
  log.info('highmap attachment url %s', JSON.stringify(attachmentUrl({
    id: highmapContent.data.mapFile
  }), null, 2))

  const props = {
    subtitle: '',
    description: '',
    mapfile: highmapContent && highmapContent.data.mapFile ? attachmentUrl({
      id: highmapContent.data.mapFile
    }) : undefined,
    htmlTable: '',
    thresholdValues: '',
    hideTitle: false,
    colorPalette: '',
    numberDecimals: '',
    heightAspectRatio: '',
    seriesTitle: '',
    legendTitle: '',
    legendAlign: '',
    footnoteText: ''
  }

  return React4xp.render('site/parts/highmap/Highmap', props, req)
}
