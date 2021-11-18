const {
  listBestBets,
  createBestBet
} = __non_webpack_require__('/lib/ssb/repo/bestbet')
const {
  ensureArray
} = __non_webpack_require__('/lib/ssb/utils/arrayUtils')

exports.get = () => {
  const bestbets = ensureArray(listBestBets(100)) // TODO: Do not forget hard coded count value
  if (bestbets) {
    return {
      // body: {
      // // total: bestbets.total,
      //   count: bestbets.length,
      //   hits: bestbets.map((bet) => ({
      //     id: bet._id,
      //     linkedContentId: bet.linkedContentId,
      //     searchWords: bet.searchWords
      //   })
      //   )
      // }
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
  const body = JSON.parse(req.body)
  const response = createBestBet(body.id, body.linkedContentId, body.linkedContentTitle, body.searchWords)
  return response
}
