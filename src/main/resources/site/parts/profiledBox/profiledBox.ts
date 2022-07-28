import { Content } from '/lib/xp/content'
import { ResourceKey, render } from 'enonic-types/thymeleaf'
import { formatDate } from '../../../lib/ssb/utils/dateUtils'
import { React4xp, React4xpObject } from '../../../lib/types/react4xp'
import { ProfiledBoxPartConfig } from './profiledBox-part-config'

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

const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const view: ResourceKey = resolve('./profiledBox.html')

exports.get = function(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part: ', e)
  }
}

exports.preview = (req: XP.Request): XP.Response => renderPart(req)

function renderPart(req: XP.Request): XP.Response {
  const page: Content = getContent()
  const config: ProfiledBoxPartConfig = getComponent().config
  const language: string = page.language === 'en' || page.language === 'nn' ? page.language : 'nb'
  const urlContentSelector: ProfiledBoxPartConfig['urlContentSelector'] = config.urlContentSelector
  const titleSize: string = getTitleSize(config.title)

  const props: ProfiledBoxProps = {
    imgUrl: imageUrl({
      id: config.image,
      scale: 'block(315, 215)'
    }),
    imageAltText: getImageAlt(config.image) ? getImageAlt(config.image) : ' ',
    imagePlacement: (config.cardOrientation == 'horizontal') ? 'left' : 'top',
    href: getLink(urlContentSelector),
    subTitle: getSubtitle(config.content, config.date, language),
    title: config.title,
    preambleText: config.preamble,
    linkType: 'header',
    titleSize: titleSize,
    ariaLabel: config.title,
    ariaDescribedBy: 'subtitle'
  }

  const profiledBox: React4xpObject = new React4xp('site/parts/profiledBox/profiledBox')
    .setProps(props)
    .setId('profiled-box')
    .uniqueId()

  const body: string = render(view, {
    profiledBoxId: profiledBox.react4xpId
  })

  return {
    body: profiledBox.renderBody({
      body
    }),
    pageContributions: profiledBox.renderPageContributions() as XP.PageContributions
  }
}

function getLink(urlContentSelector: ProfiledBoxPartConfig['urlContentSelector']): string | undefined {
  if (urlContentSelector._selected == 'optionLink') {
    return urlContentSelector.optionLink.link
  }

  if (urlContentSelector._selected == 'optionXPContent') {
    return urlContentSelector.optionXPContent.xpContent ? pageUrl({
      id: urlContentSelector.optionXPContent.xpContent
    }) : ''
  }
  return ''
}

function getSubtitle(content: string | undefined, date: string | undefined, language: string): string {
  if (content && date) {
    return content + ' / ' + (formatDate(date, 'PPP', language) as string)
      .toLowerCase()
  } else if (content) {
    return content
  } else if (date) {
    return (formatDate(date, 'PPP', language) as string)
      .toLowerCase()
  } else {
    return ''
  }
}

function getTitleSize(title: string): string {
  const titleLength: number = title.length
  let titleSize: string = 'sm'
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

interface ProfiledBoxProps {
  imgUrl: string;
  imageAltText: string | undefined;
  imagePlacement: string;
  href: string | undefined;
  subTitle: string;
  title: string;
  preambleText: string;
  linkType: string;
  titleSize: string;
  ariaLabel: string | undefined;
  ariaDescribedBy: string | undefined;
}
