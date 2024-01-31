import { renderError } from '/lib/ssb/error/error'
import { preview } from '../../parts/factBox/factBox'
import { type FactBox } from '.'

export function macro(context: XP.MacroContext<FactBox>) {
  try {
    const factBox = preview(context.request, context.params.factBox)

    if (factBox.status && factBox.status !== 200) throw new Error(`factBox with id ${context.params.factBox} missing`)

    return factBox
  } catch (e) {
    return renderError(context.request, 'Error in macro', e)
  }
}
