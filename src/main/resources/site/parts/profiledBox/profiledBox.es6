import { formatDate } from '../../../lib/ssb/utils/dateUtils'

const {
  getContent,
  getComponent,
  pageUrl,
  imageUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const {
  getImageAlt
} = __non_webpack_require__('/lib/ssb/utils/imageUtils')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const view = resolve('./profiledBox.html')

exports.get = function(req) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part: ', e)
  }
}

exports.preview = (req) => renderPart(req)

function renderPart(request) {
  const page = getContent()
  const part = getComponent()
  const language = page.language === 'en' || page.language === 'nn' ? page.language : 'nb'
  const urlContentSelector = part.config.urlContentSelector
  const titleSize = getTitleSize(part.config.title)

  const props = {
    imgUrl: imageUrl({
      id: part.config.image,
      scale: 'block(315, 215)'
    }),
    imageAltText: getImageAlt(part.config.image) ? getImageAlt(part.config.image) : ' ',
    imagePlacement: (part.config.cardOrientation == 'horizontal') ? 'left' : 'top',
    href: getLink(urlContentSelector),
    subTitle: getSubtitle(part.config.content, part.config.date, language),
    title: part.config.title,
    preambleText: part.config.preamble,
    linkType: 'header',
    titleSize: titleSize
  }

  const profiledBox = new React4xp('site/parts/profiledBox/profiledBox')
    .setProps(props)
    .setId('profiled-box')
    .uniqueId()

  const body = render(view, {
    profiledBoxId: profiledBox.react4xpId
  })

  return {
    body: profiledBox.renderBody({
      body
    }),
    pageContributions: profiledBox.renderPageContributions()
  }
}

/**
 * get external/internal link from config
 * @param {Object} urlContentSelector
 * @return {string}
 */

function getLink(urlContentSelector) {
  if (urlContentSelector._selected == 'optionLink') {
    return urlContentSelector.optionLink.link
  }

  if (urlContentSelector._selected == 'optionXPContent') {
    return pageUrl({
      id: urlContentSelector.optionXPContent.xpContent
    })
  }
  return ''
}

/**
 * get subtitle situated on top of card (content / date)
 * @param {string} content
 * @param {string} date
 * @return {string}
 */

function getSubtitle(content, date, language) {
  if (content && date) {
    return content + ' / ' + formatDate(date, 'PPP', language)
      .toLowerCase()
  } else if (content) {
    return content
  } else if (date) {
    return formatDate(date, 'PPP', language)
      .toLowerCase()
  } else {
    return ''
  }
}

function getTitleSize(title) {
  const titleLength = title.length
  let titleSize = 'sm'
  if (titleLength > 25) {
    titleSize = 'md'
  }
  if (titleLength > 50) {
    titleSize = 'lg'
  }
  if (titleLength > 75) {
    titleSize = 'xl'
  }
  return titleSize
}
