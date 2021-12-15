const {
  data: {
    forceArray
  }
} = __non_webpack_require__('/lib/util')
const {
  getContent, getComponent, imageUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const {
  get
} = __non_webpack_require__('/lib/xp/content')
const {
  getSources
} = __non_webpack_require__('/lib/ssb/utils/utils')
const {
  getPhrases
} = __non_webpack_require__('/lib/ssb/utils/language')
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')

import { Content, MediaImage } from 'enonic-types/content'
import { Request, Response } from 'enonic-types/controller'
import { SourceList, SourcesConfig } from '../../../lib/ssb/utils/utils'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { StaticVisualization } from '../../content-types/staticVisualization/staticVisualization'
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { Base64 } from 'js-base64'
import { DefaultPageConfig } from '../../pages/default/default-page-config'
import { StaticVisualizationPartConfig } from './staticVisualization-part-config'


exports.get = function(req: Request): Response | React4xpResponse {
  try {
    const config: StaticVisualizationPartConfig = getComponent().config
    const contentId: string | undefined = config.staticVisualizationContent
    return renderPart(req, contentId)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: Request, contentId: string | undefined): Response | React4xpResponse => {
  try {
    return renderPart(req, contentId)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

function renderPart(req: Request, contentId: string | undefined): React4xpResponse | Response {
  const page: DefaultPage = getContent() as DefaultPage
  const phrases: {source: string; descriptionStaticVisualization: string} = getPhrases(page)
  const sourcesLabel: string = phrases.source
  const descriptionStaticVisualization: string = phrases.descriptionStaticVisualization

  const staticVisualizationsContent: Content<StaticVisualization> | null = contentId ? get({
    key: contentId
  }) : null

  if (staticVisualizationsContent) {
    const sourceConfig: StaticVisualization['sources'] = staticVisualizationsContent.data.sources ? forceArray(staticVisualizationsContent.data.sources) : []

    // Encodes string to base64 and turns it into a dataURI
    const desc: string = Base64.encodeURI(staticVisualizationsContent.data.longDesc)
    const longDesc: string = 'data:text/html;charset=utf-8;base64,' + desc

    const imageSrc: string | null = imageUrl({
      id: staticVisualizationsContent.data.image,
      scale: 'max(850)'
    })

    // Retrieves image as content to get image meta data
    const imageData: Content<MediaImage> | null = get({
      key: staticVisualizationsContent.data.image
    })

    const props: StaticVisualizationProps = {
      title: staticVisualizationsContent.displayName,
      altText: imageData && imageData.data.altText ? imageData.data.altText : (imageData && imageData.data.caption ? imageData.data.caption : ' '),
      imageSrc: imageSrc,
      footnotes: staticVisualizationsContent.data.footNote ? forceArray(staticVisualizationsContent.data.footNote) : [],
      sources: getSources(sourceConfig as Array<SourcesConfig>),
      longDesc,
      sourcesLabel,
      descriptionStaticVisualization,
      inFactPage: page.page.config && page.page.config.pageType === 'factPage',
      tableData: staticVisualizationsContent.data.tableData ? staticVisualizationsContent.data.tableData : ''
    }

    return React4xp.render('site/parts/staticVisualization/staticVisualization', props, req)
  }
  return {
    body: null
  }
}

  interface DefaultPage {
    page: {
      config: DefaultPageConfig;
    };
  }

  interface StaticVisualizationProps {
    title: string;
    altText: string;
    imageSrc: string;
    footnotes: StaticVisualization['footNote'];
    sources: SourceList;
    longDesc: string;
    sourcesLabel: string;
    descriptionStaticVisualization: string;
    inFactPage?: boolean;
    tableData: string;
  }

