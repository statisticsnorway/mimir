// import { getComponent } from '/lib/xp/portal'
// import { render as r4xpRender } from '/lib/enonic/react4xp'
// import { renderError } from '/lib/ssb/error/error'

// export function get(req: XP.Request) {
//   try {
//     return renderPart(req)
//   } catch (e) {
//     return renderError(req, 'Error in part request', e)
//   }
// }

// export function renderPart(req: XP.Request): XP.Response {
//   const part = getComponent<XP.PartComponent.PopUp>()
//   if (!part) throw Error('No part found')

//   return r4xpRender('site/parts/popup/popup', req, {
//     body: `<section class="xp-part part-popup"></section>`,
//   })
// }
