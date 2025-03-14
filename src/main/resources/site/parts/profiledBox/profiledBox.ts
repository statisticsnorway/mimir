import { getContent, getComponent } from '/lib/xp/portal'
import { render } from '/lib/thymeleaf'
import { getLinkTargetUrl, getProfiledCardAriaLabel, randomUnsafeString } from '/lib/ssb/utils/utils'
import { render as r4xpRender } from '/lib/enonic/react4xp'
import { formatDate } from '/lib/ssb/utils/dateUtils'
import { imageUrl, getImageAlt } from '/lib/ssb/utils/imageUtils'

import { renderError } from '/lib/ssb/error/error'
import { type ProfiledBoxProps } from '/lib/types/partTypes/profiledBox'
import { type ProfiledBox as ProfiledBoxPartConfig } from '.'

const view = resolve('profiledBox.html')

export function get(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part: ', e)
  }
}

export function preview(req: XP.Request): XP.Response {
  return renderPart(req)
}

function renderPart(req: XP.Request): XP.Response {
  const page = getContent()
  if (!page) throw Error('No page found')

  const config = getComponent<XP.PartComponent.ProfiledBox>()?.config
  if (!config) throw Error('No part found')

  const language: string = page.language === 'en' || page.language === 'nn' ? page.language : 'nb'
  const urlContentSelector: ProfiledBoxPartConfig['urlContentSelector'] = config.urlContentSelector
  const id: string = 'profiled-box-' + randomUnsafeString()
  const body: string = render(view, {
    profiledBoxId: id,
  })

  const title = config.title
  const subTitle = getSubtitle(config.content, config.date, language)
  const props: ProfiledBoxProps = {
    imgUrl: imageUrl({
      id: config.image,
      scale: 'block(315, 215)',
      format: 'jpg',
    }),
    imageAltText: getImageAlt(config.image) ?? ' ',
    imagePlacement: config.cardOrientation == 'horizontal' ? 'left' : 'top',
    href: getLinkTargetUrl(urlContentSelector),
    subTitle,
    title,
    preambleText: config.preamble,
    titleSize: getTitleSize(title),
    ariaLabel: getProfiledCardAriaLabel(subTitle),
  }

  return r4xpRender('site/parts/profiledBox/profiledBox', props, req, {
    id: id,
    body: body,
    hydrate: false,
  })
}

function getSubtitle(content: string | undefined, date: string | undefined, language: string): string {
  if (content && date) {
    return content + ' / ' + (formatDate(date, 'PPP', language) as string).toLowerCase()
  } else if (content) {
    return content
  } else if (date) {
    return (formatDate(date, 'PPP', language) as string).toLowerCase()
  } else {
    return ''
  }
}

function getTitleSize(title: string): string {
  const titleLength: number = title.length
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
