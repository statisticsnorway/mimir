import { get as getContentByKey, type Content } from '/lib/xp/content'
import type { SourceList, SourcesConfig } from '/lib/ssb/utils/utils'
import { render } from '/lib/enonic/react4xp'
import type { StaticVisualization } from '/site/content-types'
import type { Default as DefaultPageConfig } from '/site/pages/default'
import type { HtmlTable } from '/lib/ssb/parts/table'
import { getContent, getComponent } from '/lib/xp/portal'
import { localize } from '/lib/xp/i18n'
import { imageUrl } from '/lib/ssb/utils/imageUtils'
import { randomUnsafeString } from '/lib/ssb/utils/utils'

const {
  data: { forceArray },
} = __non_webpack_require__('/lib/util')
const { renderError } = __non_webpack_require__('/lib/ssb/error/error')
const { getSources } = __non_webpack_require__('/lib/ssb/utils/utils')
const { getPhrases } = __non_webpack_require__('/lib/ssb/utils/language')
const { parseHtmlString } = __non_webpack_require__('/lib/ssb/parts/table')

export function get(req: XP.Request): XP.Response {
  try {
    const config = getComponent<XP.PartComponent.StaticVisualization>()?.config
    if (!config) throw Error('No part found')

    const contentId: string | undefined = config.staticVisualizationContent
    return renderPart(req, contentId)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request, contentId: string | undefined): XP.Response {
  try {
    return renderPart(req, contentId)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

function renderPart(req: XP.Request, contentId: string | undefined): XP.Response {
  const content = getContent<Content<DefaultPage>>()
  if (!content?.page) throw Error('No content found')
  const phrases: { source: string; descriptionStaticVisualization: string } = getPhrases(content)
  const sourcesLabel: string = phrases.source
  const descriptionStaticVisualization: string = phrases.descriptionStaticVisualization

  const staticVisualizationsContent: Content<StaticVisualization> | null = contentId
    ? getContentByKey({
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
      format: 'jpg',
    })

    // Retrieves image as content to get image meta data
    const imageData: Content<MediaImage> | null = getContentByKey({
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
          : '',
      imageSrc: imageSrc,
      footnotes: staticVisualizationsContent.data.footNote ? forceArray(staticVisualizationsContent.data.footNote) : [],
      sources: getSources(sourceConfig as Array<SourcesConfig>),
      longDesc: staticVisualizationsContent.data.longDesc,
      sourcesLabel,
      showAsGraphLabel,
      showAsTableLabel,
      descriptionStaticVisualization,
      inFactPage: content.page.config && content.page.config.pageType === 'factPage',
      language: language,
      tableData: htmlTable,
      id: randomUnsafeString(),
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
  id: string
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
