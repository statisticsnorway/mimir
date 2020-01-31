const {
  getComponent,
  pageUrl,
  imageUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')

const moment = require('moment/min/moment-with-locales')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')

moment.locale('nb')

exports.get = function(req) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError('Error in part: ', e)
  }
}

exports.preview = (req) => renderPart(req)

function renderPart(request) {
  const part = getComponent()
  const urlContentSelector = part.config.urlContentSelector

  const props = {
    imgUrl: imageUrl({
      id: part.config.image,
      scale: 'block(315, 215)'
    }),
    imagePlacement: 'left',
    href: getLink(urlContentSelector),
    subTitle: part.config.content + ' / ' + moment(part.config.date).format('DD. MMMM YYYY').toLowerCase(),
    title: part.config.title,
    preambleText: part.config.preamble,
    linkType: 'header'
  }

  return React4xp.render(part, props, request)
}

function getLink(urlContentSelector) {
  if(urlContentSelector._selected == 'optionLink') {
    return urlContentSelector.optionLink.link
  }

  if(urlContentSelector._selected == 'optionXPContent') {
    return pageUrl({ id: urlContentSelector.optionXPContent.xpContent })
  }
  return ''
}
