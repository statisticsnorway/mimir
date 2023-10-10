import { renderError } from '/lib/ssb/error/error'
import { type Highchart as HighchartConfig } from '/site/macros/highchart'

import { preview as highchartControllerPreview } from '../../parts/highchart/highchart'
import { preview as dividerControllerPreview } from '../../parts/divider/divider'

export function macro(context: XP.MacroContext<HighchartConfig>): XP.Response {
  try {
    const divider: XP.Response = dividerControllerPreview(context.request, {
      dark: false,
    })

    const config = context.params
    const highchart: XP.Response = highchartControllerPreview(context.request, config.highchart)

    if (highchart.status && highchart.status !== 200) throw new Error(`Highchart with id ${config.highchart} missing`)
    highchart.body = (divider.body as string) + highchart.body + divider.body

    return highchart
  } catch (e) {
    return renderError(context.request, 'Error in macro', e)
  }
}
