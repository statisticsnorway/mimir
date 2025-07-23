import { getContent, getComponent, Content, type ImageUrlParams } from '/lib/xp/portal'
import { render } from '/lib/thymeleaf'
import {
  getLinkTargetUrl,
  getLinkTargetXPContent,
  getProfiledCardAriaLabel,
  getSubTitle,
  getXPContentImage,
  randomUnsafeString,
} from '/lib/ssb/utils/utils'
import { render as r4xpRender } from '/lib/enonic/react4xp'
import { formatDate } from '/lib/ssb/utils/dateUtils'
import { imageUrl, getImageAlt } from '/lib/ssb/utils/imageUtils'

import { renderError } from '/lib/ssb/error/error'
import { type ProfiledBoxProps } from '/lib/types/partTypes/profiledBox'
import { type Article } from '/site/content-types'
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
  const id: string = 'profiled-box-' + randomUnsafeString()
  const body: string = render(view, {
    profiledBoxId: id,
  })

  return r4xpRender('site/parts/profiledBox/profiledBox', parseProfiledBoxProps(config, language), req, {
    id: id,
    body: body,
    hydrate: false,
  })
}

function getSubtitleFromConfig(content: string | undefined, date: string | undefined, language: string): string {
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

function parseProfiledBoxProps(config: ProfiledBoxPartConfig, language: string): ProfiledBoxProps {
  const urlContentSelector: ProfiledBoxPartConfig['urlContentSelector'] = config.urlContentSelector
  const linkTargetXPContent = getLinkTargetXPContent(config.urlContentSelector)

  const title = config.title ?? linkTargetXPContent?.displayName ?? ''
  const subTitle =
    config.content || config.date
      ? getSubtitleFromConfig(config.content, config.date, language) // TODO: If either config.content or config.date is empty, what should be returned?
      : (getSubTitle(linkTargetXPContent as Content<Article>, language) ?? '')
  const imageDimensions = {
    scale: 'block(315, 215)' as ImageUrlParams['scale'],
    format: 'jpg',
    placeholderWidth: 315,
    placeholderHeight: 215,
  }
  const { imageSrc, imageAlt } = getXPContentImage(linkTargetXPContent as Content<Article>, imageDimensions)
  return {
    imgUrl: config.image
      ? imageUrl({
          id: config.image,
          scale: imageDimensions.scale,
          format: imageDimensions.format,
        })
      : (imageSrc ?? ''),
    imageAltText: config.image ? getImageAlt(config.image) : (imageAlt ?? ''),
    imagePlacement: config.cardOrientation == 'horizontal' ? 'left' : 'top',
    href: getLinkTargetUrl(urlContentSelector),
    subTitle,
    title,
    preambleText: config.preamble ?? (linkTargetXPContent?.data?.ingress as string) ?? '',
    titleSize: getTitleSize(title),
    ariaLabel: getProfiledCardAriaLabel(subTitle),
  }
}
