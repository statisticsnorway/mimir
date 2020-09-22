import { getQueryChildNodesStatus } from '../../lib/repo/eventLog'

exports.get = (req) => {
  log.info('glnrbn eventLog service reached!')
  const status = getQueryChildNodesStatus(`/queries/${req.params.queryId}`)
  log.info('glnrbn status: ' + JSON.stringify(status, null, 2))

  return {
    contentType: 'application/json',
    body: status,
    status: 200
  }
}
