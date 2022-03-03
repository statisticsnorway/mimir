import { React4xpResponse } from '/lib/enonic/react4xp'
import { StaticVisualizationConfig } from './staticVisualization-config'

const {
  preview
} = __non_webpack_require__('../../parts/staticVisualization/staticVisualization')

exports.macro = (context: XP.MacroContext): XP.Response | React4xpResponse => {
  const config: StaticVisualizationConfig = context.params
  return preview(context, config.staticVisualizationContent)
}
