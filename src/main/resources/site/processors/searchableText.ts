import { type Request, type Response } from '@enonic-types/core'

export function responseProcessor(req: Request, res: Response) {
  if (res.status === 200 && res.body) {
    res.body = (res.body as string).replace(
      /<section data-portal-component-type="text">/g,
      '<section class="searchabletext" data-portal-component-type="text">'
    )
  }
  return res
}
