const moment = require('moment/min/moment-with-locales')
const { getComponent, pageUrl, imageUrl } = __non_webpack_require__('/lib/xp/portal')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const thymeleaf = __non_webpack_require__('/lib/thymeleaf')

const view = resolve('./relatedArticle.html')

exports.get = function() {
  return renderPart()
}

exports.preview = function() {
  return renderPart()
}

function renderPart() {
  const part = getComponent()
  const xpContent = pageUrl({ id: part.config.xpContent })

  const relatedArticle = new React4xp('RelatedArticle')
    .setProps({
      imgUrl: imageUrl({
        id: part.config.image,
        scale: 'block(315, 215)'
      }),
      imagePlacement: 'top', // TODO: desktop. remove after component has been updated to be more responsive
      href: (part.config.link) ? part.config.link : xpContent, // TODO: This is for header link; should be on onClick
      content: part.config.content + '/' + getDate(moment(part.config.date).format('DD. MM YYYY')),
      preambleText: part.config.preamble,
      small: true,
      headerLink: part.config.title,
      linkType: 'header'
    })

  const preRenderedBody = thymeleaf.render(view, { relatedArticle })

  return {
    body: relatedArticle.renderBody({
      body: preRenderedBody
    })
  }
}

function getDate(date) {
  const monthUnit = date.substring(4,6)
  const newDate = date.replace(monthUnit, getMonth(monthUnit))
  return newDate
}

function getMonth(monthUnit) {
  switch (monthUnit) {
  case '01':
    return 'januar'
    break
  case '02':
    return 'februar'
    break
  case '03':
    return 'mars'
    break
  case '04':
    return 'april'
    break
  case '05':
    return 'mai'
    break
  case '06':
    return 'juni'
    break
  case '07':
    return 'juli'
    break
  case '08':
    return 'august'
    break
  case '09':
    return 'september'
    break
  case '10':
    return 'oktober'
    break
  case '11':
    return 'november'
    break
  case '12':
    return 'desember'
    break
  default:
    return ''
    break
  }
}
