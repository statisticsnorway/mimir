import { MacroContext } from 'enonic-types/controller'
import { Response, ResponseType } from 'enonic-types/controller'
import { React4xpResponse } from '../../../lib/types/react4xp'

// eslint-disable-next-line @typescript-eslint/typedef
const linksController = __non_webpack_require__('../../parts/links/links')

exports.macro = function(context: MacroContext): React4xpResponse | Response<ResponseType> {
  return linksController.preview(context, context.params)
}
