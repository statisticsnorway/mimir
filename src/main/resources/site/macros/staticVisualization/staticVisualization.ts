import { MacroContext, Response } from 'enonic-types/controller'
import { React4xpResponse } from '../../../lib/types/react4xp'
import { StaticVisualizationConfig } from './staticVisualization-config'

const {
  preview
} = __non_webpack_require__('../../parts/staticVisualization/staticVisualization')

exports.macro = (context: MacroContext): Response | React4xpResponse => {
  const config: StaticVisualizationConfig = context.params
  return preview(context, config.staticVisualizationContent)
}
