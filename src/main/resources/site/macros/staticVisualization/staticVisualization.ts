import { MacroContext, Response } from 'enonic-types/controller'
import { React4xpResponse } from '../../../lib/types/react4xp'
import { StaticVisualizationConfig } from './staticVisualization-config'

const {
  preview
} = __non_webpack_require__('../../parts/staticVisualization/staticVisualization')

const {
  preview: dividerControllerPreview
} = __non_webpack_require__('../../parts/divider/divider')

const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')

exports.macro = (context: MacroContext): Response | React4xpResponse => {
  try {
    const divider: Response = dividerControllerPreview(context, {
      dark: false
    })

    const config: StaticVisualizationConfig = context.params
    const staticVisualization: Response = preview(context, config.staticVisualizationContent)

    if (staticVisualization.status && staticVisualization.status !== 200) throw new Error(`Static Visualization with id ${config.staticVisualizationContent} missing`)
    staticVisualization.body = divider.body as string + staticVisualization.body + divider.body

    return staticVisualization

  } catch (e) {
    return renderError(context.request, 'Error in macro', e)
  }
}
