import { renderError } from '/lib/ssb/error/error'
import { preview } from '/site/parts/maths/maths'
import { type Maths } from '/site/macros/maths'

export function macro(context: XP.MacroContext<Maths>) {
  try {
    const config = context.params
    const maths: XP.Response = preview(context.request, config)
    if (maths.status && maths.status !== 200) throw new Error(`Maths with id ${config.contentId} is missing`)
    maths.body = `<div>${maths.body}</div>`

    return maths
  } catch (e) {
    return renderError(context.request, 'Error in macro', e)
  }
}
