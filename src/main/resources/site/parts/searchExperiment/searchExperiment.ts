import { serviceUrl } from '/lib/xp/portal'
import { render } from '/lib/enonic/react4xp'

export function get(req: XP.Request): XP.Response {
  return renderPart(req)
}

export function preview(req: XP.Request): XP.Response {
  return renderPart(req)
}

function renderPart(req: XP.Request): XP.Response {
  const result = render(
    'site/parts/searchExperiment/searchExperiment',
    {
      searchUrl: serviceUrl({
        service: 'googleSearch',
      }),
      query: req.params.q,
    },
    req
  )
  return result
}
