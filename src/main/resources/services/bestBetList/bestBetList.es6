const {
  listBestBets,
  createBestBet
} = __non_webpack_require__('/lib/ssb/repo/bestbet')
const {
  ensureArray
} = __non_webpack_require__('/lib/ssb/utils/arrayUtils')

exports.get = () => {
  const bestbets = ensureArray(listBestBets(1000))
  if (bestbets) {
    return {
      body: bestbets.map((bet) => {
        return {
          id: bet._id,
          linkedContentId: bet.data.linkedContentId,
          linkedContentTitle: bet.data.linkedContentTitle,
          linkedContentHref: bet.data.linkedContentHref,
          searchWords: ensureArray(bet.data.searchWords)
        }
      })
    }
  } else return {}
}
exports.post = (req) => {
  log.info('GLNRBN being posted: ' + JSON.stringify(req.body, null, 2))
  const body = JSON.parse(req.body)
  const response = createBestBet(body.id, body.linkedContentId, body.linkedContentTitle, body.searchWords)
  return response
}
