import { preview as highchartControllerPreview } from '/site/parts/highchart/highchart'

export function preview(req: XP.Request, id: string): XP.Response {
  return highchartControllerPreview(req, id)
}
