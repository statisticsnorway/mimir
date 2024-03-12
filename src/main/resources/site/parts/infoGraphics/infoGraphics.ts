// @ts-ignore
import { Base64 } from 'js-base64'
import { get as getContentByKey, type Content } from '/lib/xp/content'
import { getContent, getComponent } from '/lib/xp/portal'
import { render } from '/lib/enonic/react4xp'
import { getSources } from '/lib/ssb/utils/utils'
import { type SourcesConfig } from '/lib/types/sources'
import { imageUrl } from '/lib/ssb/utils/imageUtils'

import * as util from '/lib/util'
import { renderError } from '/lib/ssb/error/error'
import { getPhrases } from '/lib/ssb/utils/language'
import { type InfoGraphicsProps } from '/lib/types/partTypes/infoGraphics'
import { type InfoGraphics as InfoGraphicsPartConfig } from '.'

export function get(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request): XP.Response {
  return renderPart(req)
}

function renderPart(req: XP.Request) {
  const page = getContent()
  if (!page) throw Error('No page found')

  const phrases: { source: string; descriptionStaticVisualization: string } = getPhrases(page)
  const sourcesLabel: string = phrases.source
  const descriptionStaticVisualization: string = phrases.descriptionStaticVisualization

  const config = getComponent<XP.PartComponent.InfoGraphics>()?.config
  if (!config) throw Error('No part found')

  const sourceConfig: InfoGraphicsPartConfig['sources'] = config.sources ? util.data.forceArray(config.sources) : []

  // Encodes string to base64 and turns it into a dataURI
  const desc: string = Base64.encodeURI(config.longDesc ? config.longDesc : '')
  const longDesc: string = 'data:text/html;charset=utf-8;base64,' + desc

  const imageSrc: string | null = imageUrl({
    id: config.image,
    scale: 'max(850)',
    format: 'jpg',
  })

  // Retrieves image as content to get image meta data
  const imageData: Content<MediaImage> | null = getContentByKey({
    key: config.image,
  })

  const props: InfoGraphicsProps = {
    title: config.title,
    altText:
      imageData && imageData.data.altText
        ? imageData.data.altText
        : imageData && imageData.data.caption
          ? imageData.data.caption
          : '',
    imageSrc: imageSrc,
    footnotes: config.footNote ? util.data.forceArray(config.footNote) : [],
    sources: getSources(sourceConfig as Array<SourcesConfig>),
    longDesc,
    sourcesLabel,
    descriptionStaticVisualization,
    oldContent: true,
  }

  return render('site/parts/infoGraphics/infoGraphics', props, req)
}
