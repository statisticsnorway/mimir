const {
  listBestBets,
  createBestBet,
  deleteBestBet
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
          linkedContentIngress: bet.data.linkedContentIngress,
          linkedContentType: bet.data.linkedContentType,
          linkedContentDate: bet.data.linkedContentDate,
          linkedContentSubject: bet.data.linkedContentSubject,
          searchWords: ensureArray(bet.data.searchWords)
        }
      })
    }
  } else return {}
}
exports.post = (req) => {
  const body = JSON.parse(req.body)
  const response = createBestBet(
    body.id,
    body.linkedContentTitle,
    body.linkedContentHref,
    body.linkedContentIngress,
    body.linkedContentType,
    body.linkedContentDate,
    body.linkedContentSubject,
    body.searchWords
  )
  return response
}
exports.delete = (req) => {
  return deleteBestBet(req.params.key)
}
