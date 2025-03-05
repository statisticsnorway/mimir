import { getComponent, getContent, pageUrl } from '/lib/xp/portal'
import { localize } from '/lib/xp/i18n'
import { render } from '/lib/enonic/react4xp'
import { renderError } from '/lib/ssb/error/error'
import { imageUrl, getImageAlt } from '/lib/ssb/utils/imageUtils'
import {
  type Event,
  type SimpleBox,
  type ExpansionBox,
  type DirectorBox,
  type TimelineElement,
  type TimelineEvent,
} from '/lib/types/partTypes/timeline'
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
    const events: Event[] = element.event ? forceArray(element.event) : []
    const parsedEvents: TimelineEvent[] = parseEvents(events)
    return {
      year: element.year,
      event: parsedEvents,
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

function parseEvents(events: Event[]): TimelineEvent[] {
  return events.map((event: Event) => {
    return parseEvent(event)
  })
}

function parseEvent(event: Event): TimelineEvent {
  if (event.simpleBox) {
    return parseSimpleBox(event.simpleBox)
  }

  if (event.expansionBox) {
    return parseExpansionBox(event.expansionBox)
  }
  if (event.directorBox) {
    return parseDirector(event.directorBox)
  }
  return {
    eventType: '',
    title: '',
    text: '',
    directorImage: undefined,
    directorImageAltText: '',
    timelineCategory: '',
    targetUrl: '',
  }
}

function parseSimpleBox(event: SimpleBox): TimelineEvent {
  const simpleBox = {
    eventType: 'simpleBox',
    title: event.title,
    text: event.text ?? '',
    directorImage: undefined,
    directorImageAltText: '',
    timelineCategory: event.timelineCategory,
    targetUrl: event.urlContentSelector ? getLinkTargetUrl(event) : '',
  }
  return simpleBox
}

function parseExpansionBox(event: ExpansionBox): TimelineEvent {
  return {
    eventType: 'expansionBox',
    title: event.title,
    text: event.text,
    directorImage: undefined,
    directorImageAltText: '',
    timelineCategory: event.timelineCategory,
    targetUrl: '',
  }
}

function parseDirector(event: DirectorBox): TimelineEvent {
  return {
    eventType: 'directorBox',
    title: event.title,
    text: event.text,
    directorImage: event.directorImage
      ? imageUrl({
          id: event.directorImage as string,
          scale: 'block(100,100)',
          format: 'jpg',
        })
      : undefined,
    directorImageAltText: event.directorImage ? getImageAlt(event.directorImage) : '',
    timelineCategory: 'director',
    targetUrl: event.urlContentSelector ? getLinkTargetUrl(event) : '',
  }
}

function getLinkTargetUrl(event: SimpleBox | DirectorBox): string {
  if (event.urlContentSelector?._selected == 'optionLink') {
    return event.urlContentSelector.optionLink.link ?? ''
  }

  if (event.urlContentSelector?._selected == 'optionXPContent') {
    return event.urlContentSelector.optionXPContent.xpContent
      ? pageUrl({
          id: event.urlContentSelector.optionXPContent.xpContent,
        })
      : ''
  }
  return ''
}
