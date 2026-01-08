import { type Request } from '@enonic-types/core'
import { renderError } from '/lib/ssb/error/error'
import { preview } from '/site/parts/simpleStatbank/simpleStatbank'
import { type SimpleStatbank } from '/site/macros/simpleStatbank'

export function macro(context: XP.MacroContext<SimpleStatbank>) {
  try {
    const simpleStatbank = preview(context.request as Request, context.params.simpleStatbank)

    if (simpleStatbank.status && simpleStatbank.status !== 200)
      throw new Error(`simpleStatbank with id ${context.params.simpleStatbank} missing`)

    return simpleStatbank
  } catch (e) {
    return renderError(context.request as Request, 'Error in macro', e)
  }
}
