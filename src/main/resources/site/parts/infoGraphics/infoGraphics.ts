const {
  data: { forceArray },
} = __non_webpack_require__('/lib/util')
const { getContent, getComponent, imageUrl } = __non_webpack_require__('/lib/xp/portal')
const { renderError } = __non_webpack_require__('/lib/ssb/error/error')
const { getSources } = __non_webpack_require__('/lib/ssb/utils/utils')
const { getPhrases } = __non_webpack_require__('/lib/ssb/utils/language')

import { get, Content, MediaImage } from '/lib/xp/content'
import { SourceList, SourcesConfig } from '../../../lib/ssb/utils/utils'
import { render, RenderResponse } from '/lib/enonic/react4xp'
// @ts-ignore
import { Base64 } from 'js-base64'
import type { InfoGraphics as InfoGraphicsPartConfig } from '.'
import type { Default as DefaultPageConfig } from '../../pages/default'

exports.get = function (req: XP.Request): XP.Response | RenderResponse {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: XP.Request): XP.Response | RenderResponse => renderPart(req)

function renderPart(req: XP.Request): RenderResponse {
  const page: DefaultPage = getContent() as DefaultPage
  const phrases: { source: string; descriptionStaticVisualization: string } = getPhrases(page)
  const sourcesLabel: string = phrases.source
  const descriptionStaticVisualization: string = phrases.descriptionStaticVisualization

  const config: InfoGraphicsPartConfig = getComponent().config
  const sourceConfig: InfoGraphicsPartConfig['sources'] = config.sources ? forceArray(config.sources) : []

  // Encodes string to base64 and turns it into a dataURI
  const desc: string = Base64.encodeURI(config.longDesc ? config.longDesc : '')
  const longDesc: string = 'data:text/html;charset=utf-8;base64,' + desc

  const imageSrc: string | null = imageUrl({
    id: config.image,
    scale: 'max(850)',
  })

  // Retrieves image as content to get image meta data
  const imageData: Content<MediaImage> | null = get({
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
    footnotes: config.footNote ? forceArray(config.footNote) : [],
    sources: getSources(sourceConfig as Array<SourcesConfig>),
    longDesc,
    sourcesLabel,
    descriptionStaticVisualization,
    oldContent: true,
  }

  return render('site/parts/infoGraphics/infoGraphics', props, req)
}

interface DefaultPage {
  page: {
    config: DefaultPageConfig
  }
}

interface InfoGraphicsProps {
  title: string
  altText: string
  imageSrc: string
  footnotes: InfoGraphicsPartConfig['footNote']
  sources: SourceList
  longDesc: string
  sourcesLabel: string
  descriptionStaticVisualization: string
  inFactPage?: boolean
  oldContent?: boolean
}
