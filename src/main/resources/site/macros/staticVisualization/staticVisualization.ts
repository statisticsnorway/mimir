import { RenderResponse } from '/lib/enonic/react4xp'
import { StaticVisualizationConfig } from './staticVisualization-config'

const {
  preview
} = __non_webpack_require__('../../parts/staticVisualization/staticVisualization')

exports.macro = (context: XP.MacroContext): XP.Response | RenderResponse => {
  const config: StaticVisualizationConfig = context.params
  return preview(context, config.staticVisualizationContent)
}
