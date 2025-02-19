import { getComponent, getContent, pageUrl } from '/lib/xp/portal'
import { localize } from '/lib/xp/i18n'
import { render } from '/lib/enonic/react4xp'
import { renderError } from '/lib/ssb/error/error'
import { imageUrl, getImageAlt } from '/lib/ssb/utils/imageUtils'
import { type TimelineElement, type TimelineEvent } from '/lib/types/partTypes/timeline'
import { forceArray } from '/lib/ssb/utils/arrayUtils'
import { type Timeline as TimelinePartConfig } from '/site/parts/timeline'

export function get(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part: ', e)
  }
}

function renderPart(req: XP.Request) {
  const part = getComponent<XP.PartComponent.Timeline>()
  const page = getContent()
  if (!part || !page) throw new Error('No page or part')

  const language: string = page.language ? page.language : 'nb'

  const timelineConfig: TimelinePartConfig = part.config
  const timelineItems: TimelinePartConfig['TimelineItemSet'] = forceArray(timelineConfig.TimelineItemSet)
  const timelineProps: TimelineElement[] = timelineItems.map((element) => {
    return {
      year: element.year,
      event: element.event ? parseEvent(forceArray(element.event)) : [],
    }
  })

  const showMoreText: string = localize({
    key: 'button.showMoreYears',
    locale: language === 'nb' ? 'no' : language,
  })

  const props = {
    timelineElements: timelineProps,
    showMoreButtonText: showMoreText ?? 'Vis flere år',
    countYear: 5,
  }

  return render('site/parts/timeline/timeline', props, req, {
    body: '<section class="xp-part timeline"></section>',
  })
}

function parseEvent(events: TimelineEvent[]): TimelineEvent[] {
  const parsedElements = events.map((event) => {
    const image = event.directorImage
      ? imageUrl({
          id: event.directorImage as string,
          scale: 'block(100,100)',
          format: 'jpg',
        })
      : undefined

    const imageAltText = event.directorImage ? getImageAlt(event.directorImage) : ''
    return {
      ...event,
      directorImage: image,
      directorImageAltText: imageAltText ?? '',
      targetUrl: getLinkTargetUrl(event),
    }
  })

  return parsedElements
}

function getLinkTargetUrl(event: TimelineEvent): string {
  if (event.urlArticle?._selected == 'optionLink') {
    return event.urlArticle.optionLink.link ?? ''
  }

  if (event.urlArticle?._selected == 'optionXPContent') {
    return event.urlArticle.optionXPContent.xpContent
      ? pageUrl({
          id: event.urlArticle.optionXPContent.xpContent,
        })
      : ''
  }
  return ''
}
