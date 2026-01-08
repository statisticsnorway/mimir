import { type Request, type Response } from '@enonic-types/core'
import { preview as highchartControllerPreview, get as highchartControllerGet } from '/site/parts/highchart/highchart'

export function get(req: Request): Response {
  return highchartControllerGet(req)
}

export function preview(req: Request, id: string): Response {
  return highchartControllerPreview(req, id)
}
