import { get as getContentByKey, type Content } from '/lib/xp/content'
import { getContent, getComponent } from '/lib/xp/portal'
import { localize } from '/lib/xp/i18n'
import { render } from '/lib/enonic/react4xp'
import { type HtmlTable, parseHtmlString } from '/lib/ssb/parts/table'
import { randomUnsafeString, getSources } from '/lib/ssb/utils/utils'
import { type SourcesConfig } from '/lib/types/sources'
import { imageUrl } from '/lib/ssb/utils/imageUtils'

import * as util from '/lib/util'
import { renderError } from '/lib/ssb/error/error'
import { getPhrases } from '/lib/ssb/utils/language'
import { Phrases } from '/lib/types/language'
import { DefaultPage, StaticVisualizationProps } from '/lib/types/partTypes/staticVisualization'
import { type StaticVisualization } from '/site/content-types'

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
  const phrases = getPhrases(content as unknown as Content) as Phrases
  const sourcesLabel: string = phrases.source
  const descriptionStaticVisualization: string = phrases.descriptionStaticVisualization

  const staticVisualizationsContent: Content<StaticVisualization> | null = contentId
    ? getContentByKey({
        key: contentId,
      })
    : null

  if (staticVisualizationsContent) {
    const sourceConfig: StaticVisualization['sources'] = staticVisualizationsContent.data.sources
      ? util.data.forceArray(staticVisualizationsContent.data.sources)
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
      footnotes: staticVisualizationsContent.data.footNote
        ? util.data.forceArray(staticVisualizationsContent.data.footNote)
        : [],
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
