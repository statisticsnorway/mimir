const moment = require('moment/min/moment-with-locales')
const { getComponent, pageUrl, imageUrl } = __non_webpack_require__('/lib/xp/portal')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')

moment.locale('nb')

exports.get = function(req) {
  return renderPart(req)
}

exports.preview = function(req) {
  return renderPart(req)
}

function renderPart(request) {
  const part = getComponent()
  const xpContent = pageUrl({ id: part.config.xpContent })

  const props = {
    imgUrl: imageUrl({
      id: part.config.image,
      scale: 'block(315, 215)'
    }),
    imagePlacement: 'left', // TODO: desktop. remove after component has been updated to be more responsive
    openLink: getLink(part.config.link, xpContent), // TODO: get this to work
    content: part.config.content + ' / ' + moment(part.config.date).format('DD. MMMM YYYY').toLowerCase(),
    preambleText: part.config.preamble,
    small: true,
    headerLink: part.config.title,
    linkType: 'header'
  }

  log.info(part.config.link)
  log.info(xpContent)

  return React4xp.render(part, props, request)
}

function getLink(link, xpContent) {
  if(link != null) {
    return link
  } else {
    if(xpContent != null) {
        return xpContent
      }
  }
  return ''
}
