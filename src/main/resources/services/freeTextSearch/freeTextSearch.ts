import { Request, Response } from 'enonic-types/controller'

const {
  solrSearch
} = __non_webpack_require__('/lib/ssb/utils/solrUtils')

export function get(req: Request): Response {
  const a: Response | undefined = req.params.q ? solrSearch(req.params.q) : undefined
  return {
    body: ''
  }
}
