const {
  data: { forceArray },
} = __non_webpack_require__('/lib/util')
const { getContent, getComponent, imageUrl } = __non_webpack_require__('/lib/xp/portal')
const { renderError } = __non_webpack_require__('/lib/ssb/error/error')
const { getSources } = __non_webpack_require__('/lib/ssb/utils/utils')
const { getPhrases } = __non_webpack_require__('/lib/ssb/utils/language')
const { parseHtmlString } = __non_webpack_require__('/lib/ssb/parts/table')
const { localize } = __non_webpack_require__('/lib/xp/i18n')

import { get, Content, MediaImage } from '/lib/xp/content'
import { SourceList, SourcesConfig } from '../../../lib/ssb/utils/utils'
import { render, RenderResponse } from '/lib/enonic/react4xp'
import { StaticVisualization } from '../../content-types/staticVisualization/staticVisualization'
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { DefaultPageConfig } from '../../pages/default/default-page-config'
import { StaticVisualizationPartConfig } from './staticVisualization-part-config'
import { HtmlTable } from '../../../lib/ssb/parts/table'

exports.get = function (req: XP.Request): XP.Response | RenderResponse {
  try {
    const config: StaticVisualizationPartConfig = getComponent().config
    const contentId: string | undefined = config.staticVisualizationContent
    return renderPart(req, contentId)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: XP.Request, contentId: string | undefined): XP.Response | RenderResponse => {
  try {
    return renderPart(req, contentId)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

function renderPart(req: XP.Request, contentId: string | undefined): RenderResponse | XP.Response {
  const page: DefaultPage = getContent() as DefaultPage
  const phrases: { source: string; descriptionStaticVisualization: string } = getPhrases(page)
  const sourcesLabel: string = phrases.source
  const descriptionStaticVisualization: string = phrases.descriptionStaticVisualization

  const staticVisualizationsContent: Content<StaticVisualization> | null = contentId
    ? get({
        key: contentId,
      })
    : null

  if (staticVisualizationsContent) {
    const sourceConfig: StaticVisualization['sources'] = staticVisualizationsContent.data.sources
      ? forceArray(staticVisualizationsContent.data.sources)
      : []
    const language: string = staticVisualizationsContent.language ? staticVisualizationsContent.language : 'nb'

    const showAsGraphLabel: string = localize({
      key: 'highcharts.showAsChart',
      locale: language === 'nb' ? 'no' : language,
    })

    const showAsTableLabel: string = localize({
      key: 'highcharts.showAsTable',
      locale: language === 'nb' ? 'no' : language,
    })

    const imageSrc: string | null = imageUrl({
      id: staticVisualizationsContent.data.image,
      scale: 'max(850)',
    })

    // Retrieves image as content to get image meta data
    const imageData: Content<MediaImage> | null = get({
      key: staticVisualizationsContent.data.image,
    })

    // Tabledata
    const htmlTable: HtmlTable | undefined = staticVisualizationsContent.data.tableData
      ? parseHtmlString(staticVisualizationsContent.data.tableData)
      : undefined

    const props: StaticVisualizationProps = {
      title: staticVisualizationsContent.displayName,
      altText:
        imageData && imageData.data.altText
          ? imageData.data.altText
          : imageData && imageData.data.caption
          ? imageData.data.caption
          : ' ',
      imageSrc: imageSrc,
      footnotes: staticVisualizationsContent.data.footNote ? forceArray(staticVisualizationsContent.data.footNote) : [],
      sources: getSources(sourceConfig as Array<SourcesConfig>),
      longDesc: staticVisualizationsContent.data.longDesc,
      sourcesLabel,
      showAsGraphLabel,
      showAsTableLabel,
      descriptionStaticVisualization,
      inFactPage: page.page.config && page.page.config.pageType === 'factPage',
      language: language,
      tableData: htmlTable,
    }

    return render('site/parts/staticVisualization/staticVisualization', props, req)
  }
  return {
    body: null,
  }
}

interface DefaultPage {
  page: {
    config: DefaultPageConfig
  }
}

interface StaticVisualizationProps {
  title: string
  altText: string
  imageSrc: string
  footnotes: StaticVisualization['footNote']
  sources: SourceList
  longDesc: string | undefined
  sourcesLabel: string
  showAsGraphLabel: string
  showAsTableLabel: string
  descriptionStaticVisualization: string
  inFactPage?: boolean
  language: string
  tableData: HtmlTable | undefined
}
