import { getComponent } from '/lib/xp/portal'
import { render } from '/lib/enonic/react4xp'
import { renderError } from '/lib/ssb/error/error'
import { type TimelineElement2 } from '/lib/types/partTypes/timeline'
import { forceArray } from '/lib/ssb/utils/arrayUtils'

export function get(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part: ', e)
  }
}

function renderPart(req: XP.Request) {
  const part = getComponent<XP.PartComponent.Timeline2>()
  if (!part) throw new Error('No part')
  const timelineElements: Array<TimelineElement2> = part.config.TimelineItemSet
    ? forceArray(part.config.TimelineItemSet)
    : []
  log.info('Event: ' + JSON.stringify(timelineElements, null, 4))
  const props = {
    timelineElements,
  }

  return render('site/parts/timeline2/timeline2', props, req, {
    body: '<section class="xp-part timeline"></section>',
    hydrate: false,
  })
}
