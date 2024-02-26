import { renderError } from '/lib/ssb/error/error'
import { type CombinedGraph as CombinedGraphConfig } from '/site/macros/combinedGraph'
import { preview as combinedGraphControllerPreview } from '/site/parts/combinedGraph/combinedGraph'
import { preview as dividerControllerPreview } from '/site/parts/divider/divider'

export function macro(context: XP.MacroContext<CombinedGraphConfig>): XP.Response {
  try {
    const divider: XP.Response = dividerControllerPreview(context.request, {
      dark: false,
    })

    const config = context.params
    const combinedGraph: XP.Response = combinedGraphControllerPreview(context.request, config.combinedGraph)

    if (combinedGraph.status && combinedGraph.status !== 200)
      throw new Error(`Combined graph with id ${config.combinedGraph} missing`)
    combinedGraph.body = (divider.body as string) + combinedGraph.body + divider.body

    return combinedGraph
  } catch (e) {
    return renderError(context.request, 'Error in macro', e)
  }
}
