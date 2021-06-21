import { Request, Response } from 'enonic-types/controller'
import { PreparedSearchResult } from '../../lib/ssb/utils/solrUtils'

const {
  solrSearch
} = __non_webpack_require__('/lib/ssb/utils/solrUtils')

export function get(req: Request): Response {
  return {
    body: {
      hits: req.params.q ? solrSearch(req.params.q) : []
    },
    contentType: 'application/json'
  }
}
