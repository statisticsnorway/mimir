import { preview as highchartControllerPreview, get as highchartControllerGet } from '/site/parts/highchart/highchart'

export function get(req: XP.Request): XP.Response {
  return highchartControllerGet(req)
}

export function preview(req: XP.Request, id: string): XP.Response {
  return highchartControllerPreview(req, id)
}
