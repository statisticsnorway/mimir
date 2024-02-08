import { renderError } from '/lib/ssb/error/error'
import { preview } from '../../parts/highmap/highmap'
import { Highmap } from '.'

export function macro(context: XP.MacroContext<Highmap>) {
  try {
    const highmap = preview(context.request, context.params.highmap)

    if (highmap.status && highmap.status !== 200) throw new Error(`Highmap with id ${context.params.highmap} missing`)

    return highmap
  } catch (e) {
    return renderError(context.request, 'Error in macro', e)
  }
}
