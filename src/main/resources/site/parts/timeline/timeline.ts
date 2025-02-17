import { getComponent } from '/lib/xp/portal'
import { render } from '/lib/enonic/react4xp'
import { renderError } from '/lib/ssb/error/error'
import { imageUrl, getImageAlt } from '/lib/ssb/utils/imageUtils'
import { type TimelineElement, type TimelineEvent } from '/lib/types/partTypes/timeline'
import { forceArray } from '/lib/ssb/utils/arrayUtils'

export function get(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part: ', e)
  }
}

function renderPart(req: XP.Request) {
  const part = getComponent<XP.PartComponent.Timeline>()
  if (!part) throw new Error('No part')

  const timelineElements: TimelineElement[] = part.config.TimelineItemSet ? forceArray(part.config.TimelineItemSet) : []
  const timelineProps: TimelineElement[] = timelineElements.map((element) => {
    return {
      year: element.year,
      event: element.event ? parseEvent(forceArray(element.event)) : [],
    }
  })

  const props = {
    timelineElements: timelineProps,
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
    }
  })

  return parsedElements
}
