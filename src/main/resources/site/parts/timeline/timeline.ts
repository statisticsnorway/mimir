import { getComponent } from '/lib/xp/portal'
import { render } from '/lib/enonic/react4xp'
import { renderError } from '/lib/ssb/error/error'
import { type TimelineElement } from '/lib/types/partTypes/timeline'
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
  const timelineElements: Array<TimelineElement> = part.config.TimelineItemSet
    ? forceArray(part.config.TimelineItemSet)
    : []
  const props = {
    timelineElements,
  }

  return render('site/parts/timeline/timeline', props, req, {
    body: '<section class="xp-part timeline"></section>',
    hydrate: false,
  })
}
