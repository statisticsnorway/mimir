import { MacroContext, Response } from 'enonic-types/controller'
import { React4xpResponse } from '../../../lib/types/react4xp'
import { InfoGraphicsConfig } from './infoGraphics-config'

const {
  preview
} = __non_webpack_require__('../../parts/infoGraphics/infoGraphics')

exports.macro = (context: MacroContext): Response | React4xpResponse => {
  const config: InfoGraphicsConfig = context.params
  return preview(context, config.infoGraphicsContent)
}
