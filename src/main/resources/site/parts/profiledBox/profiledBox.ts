import { type Request, type Response } from '@enonic-types/core'
import { getContent, getComponent, Content, type ImageUrlParams, processHtml } from '/lib/xp/portal'
import {
  getLinkTargetUrl,
  getLinkTargetContent,
  getProfiledCardAriaLabel,
  getSubtitleForContent,
  randomUnsafeString,
} from '/lib/ssb/utils/utils'
import { render as r4xpRender } from '/lib/enonic/react4xp'
import { imageUrl, getImageAlt, getImageFromContent } from '/lib/ssb/utils/imageUtils'

import { renderError } from '/lib/ssb/error/error'
import { type ProfiledBoxProps } from '/lib/types/partTypes/profiledBox'
import { type Article } from '/site/content-types'
import { type ProfiledBox as ProfiledBoxPartConfig } from '.'

export function get(req: Request): Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part: ', e)
  }
}

export function preview(req: Request): Response {
  return renderPart(req)
}

function renderPart(req: Request): Response {
  const page = getContent()
  if (!page) throw Error('No page found')

  const config = getComponent<XP.PartComponent.ProfiledBox>()?.config
  if (!config) throw Error('No part found')

  const language: string = page.language === 'en' || page.language === 'nn' ? page.language : 'nb'
  const id: string = 'profiled-box-' + randomUnsafeString()

  return r4xpRender('site/parts/profiledBox/profiledBox', parseProfiledBoxProps(config, language), req, {
    id,
    body: `<section class="xp-part part-profiled-box container" id="${id}"></section>`,
    hydrate: false,
  })
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
  const linkTargetContent = getLinkTargetContent(config.urlContentSelector)

  const title = config.title ?? linkTargetContent?.displayName ?? ''
  const subTitle =
    getSubtitleForContent(linkTargetContent as Content<Article>, language, config.content, config.date) ?? ''

  const imageWidth = 315
  const imageHeight = 215
  const imageDimensions = {
    scale: `block(${imageWidth}, ${imageHeight})` as ImageUrlParams['scale'],
    placeholderWidth: imageWidth,
    placeholderHeight: imageHeight,
  }
  const { imageSrc, imageAlt } = getImageFromContent(linkTargetContent as Content<Article>, imageDimensions)

  const contentIngress = linkTargetContent?.data.ingress ? processHtml({ value: linkTargetContent.data.ingress }) : ''

  return {
    imgUrl: config.image
      ? imageUrl({
          id: config.image,
          scale: imageDimensions.scale,
          format: 'jpg',
        })
      : (imageSrc ?? ''),
    imageAltText: config.image ? getImageAlt(config.image) : imageAlt,
    imagePlacement: config.cardOrientation == 'horizontal' ? 'left' : 'top',
    href: getLinkTargetUrl(urlContentSelector),
    subTitle,
    title,
    preambleText: config.preamble ?? contentIngress,
    titleSize: getTitleSize(title),
    ariaLabel: getProfiledCardAriaLabel(subTitle),
  }
}
