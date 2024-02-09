import { renderError } from '/lib/ssb/error/error'

import { preview } from '/site/parts/highmap/highmap'
import { preview as dividerControllerPreview } from '/site/parts/divider/divider'
import { Highmap } from '.'

export function macro(context: XP.MacroContext<Highmap>) {
  try {
    const divider: XP.Response = dividerControllerPreview(context.request, {
      dark: false,
    })

    const highmap = preview(context.request, context.params.highmap)

    if (highmap.status && highmap.status !== 200) throw new Error(`Highmap with id ${context.params.highmap} missing`)
    highmap.body = (divider.body as string) + highmap.body + divider.body

    return highmap
  } catch (e) {
    return renderError(context.request, 'Error in macro', e)
  }
}
