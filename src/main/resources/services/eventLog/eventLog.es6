import { getQueryChildNodesStatus } from '../../lib/repo/eventLog'

exports.get = (req) => {
  const status = getQueryChildNodesStatus(`/queries/${req.params.queryId}`)

  return {
    contentType: 'application/json',
    body: status,
    status: 200
  }
}
