import { getComponent } from '/lib/xp/portal'
import { render as r4xpRender } from '/lib/enonic/react4xp'
import { renderError } from '/lib/ssb/error/error'

export function get(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part request', e)
  }
}

export function renderPart(req: XP.Request): XP.Response {
  try {
    const part = getComponent<XP.PartComponent.CookieBannerResetButton>()
    if (!part) throw Error('No part found')

    return r4xpRender('site/parts/cookieBannerResetButton/cookieBannerResetButton', {}, req, {
      hydrate: false,
      body: `<section class="xp-part cookie-banner-reset container searchabletext">
        <div id="cookie-banner-reset-root"></div>
      </section>`,
    })
  } catch (error) {
    return renderError(req, 'Error rendering CookieBannerResetButton', error)
  }
}
