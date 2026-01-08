import { type Response } from '@enonic-types/core'
import { renderError } from '/lib/ssb/error/error'
import { type StaticVisualization as StaticVisualizationConfig } from '/site/macros/staticVisualization'

import { preview } from '/site/parts/staticVisualization/staticVisualization'

import { preview as dividerControllerPreview } from '/site/parts/divider/divider'

export const macro = (context: XP.MacroContext<StaticVisualizationConfig>): Response => {
  try {
    const divider: Response = dividerControllerPreview(context.request, {
      dark: false,
    })

    const config = context.params
    const staticVisualization: Response = preview(context.request, config.staticVisualizationContent)

    if (staticVisualization.status && staticVisualization.status !== 200)
      throw new Error(`Static Visualization with id ${config.staticVisualizationContent} missing`)
    staticVisualization.body = (divider.body as string) + staticVisualization.body + divider.body

    return staticVisualization
  } catch (e) {
    return renderError(context.request, 'Error in macro', e)
  }
}
