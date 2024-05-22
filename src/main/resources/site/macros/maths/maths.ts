import { renderError } from '/lib/ssb/error/error'
import { preview } from '/site/parts/maths/maths'
import { type Maths } from '/site/macros/maths'

export function macro(context: XP.MacroContext<Maths>) {
  try {
    const { mathsFormula } = context.params
    if (!mathsFormula) throw new Error('Missing param formula test')
    const maths = preview(context.request, context.params)

    if (maths.status && maths.status !== 200)
      throw new Error(`simpleStatbank with id ${context.params.mathsFormula} missing`)

    return maths
  } catch (e) {
    return renderError(context.request, 'Error in macro', e)
  }
}
