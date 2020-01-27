const { getComponent, pageUrl, imageUrl } = __non_webpack_require__('/lib/xp/portal')
const moment = require('moment/min/moment-with-locales')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')

moment.locale('nb')

exports.get = function(req) {
  return renderPart(req)
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
    imagePlacement: 'left', // TODO: desktop. remove after component has been updated to be more responsive
    href: getLink(urlContentSelector),
    content: part.config.content + ' / ' + moment(part.config.date).format('DD. MMMM YYYY').toLowerCase(),
    preambleText: part.config.preamble,
    small: true,
    headerLink: part.config.title,
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
