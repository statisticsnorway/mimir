import { get as getContentByKey, type Content } from '/lib/xp/content'
import type { SourceList, SourcesConfig } from '/lib/ssb/utils/utils'
import { render } from '/lib/enonic/react4xp'
import type { StaticVisualization } from '/site/content-types'
// @ts-ignore
import type { Default as DefaultPageConfig } from '/site/pages/default'
import type { StaticVisualization as StaticVisualizationPartConfig } from '.'
import type { HtmlTable } from '/lib/ssb/parts/table'
import { getContent, getComponent } from '/lib/xp/portal'
import { localize } from '/lib/xp/i18n'
import { imageUrl } from '/lib/ssb/utils/imageUtils'

const {
  data: { forceArray },
} = __non_webpack_require__('/lib/util')
const { renderError } = __non_webpack_require__('/lib/ssb/error/error')
const { getSources } = __non_webpack_require__('/lib/ssb/utils/utils')
const { getPhrases } = __non_webpack_require__('/lib/ssb/utils/language')
const { parseHtmlString } = __non_webpack_require__('/lib/ssb/parts/table')

export function get(req: XP.Request): XP.Response {
  try {
    const config = getComponent<StaticVisualizationPartConfig>()?.config
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
  const page: DefaultPage = getContent() as DefaultPage
  const phrases: { source: string; descriptionStaticVisualization: string } = getPhrases(page)
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
