import { type VertexSearch } from '/lib/googleServices'

const vertexSearch: VertexSearch = __.newBean('no.ssb.xp.vertex.VertexService')

const search = __.newBean('no.ssb.xp.vertex.Search')

try {
  search.run()
} catch (e) {
  log.error(e)
}

export function get(): XP.Response {
  return {
    body: vertexSearch.getVertex(),
    contentType: 'application/json',
    status: 200,
  }
}
