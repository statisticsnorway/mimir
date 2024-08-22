import { getComponent, getContent } from '/lib/xp/portal'

import { renderError } from '/lib/ssb/error/error'
import { render } from '/lib/enonic/react4xp'
import { type WebcruiterAdvertismentListProps } from '/lib/types/partTypes/webcruiterAdvertismentList'

export function get(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request): XP.Response {
  return renderPart(req)
}

function renderPart(req: XP.Request) {
  const content = getContent()
  if (!content) throw Error('No page found')

  const config = getComponent<XP.PartComponent.WebcruiterAdvertismentList>()?.config
  const props: WebcruiterAdvertismentListProps = {
    title: config?.title ?? '',
  }
  return render('site/parts/webcruiterAdvertismentList/WebcruiterAdvertismentList', props, req, {
    body: `<section class="xp-part webrecruiter-advertisment-list"></section>`,
  })
}
