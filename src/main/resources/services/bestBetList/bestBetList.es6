import { sanitize } from '/lib/xp/common'

const { listBestBets, createBestBet, deleteBestBet } = __non_webpack_require__('/lib/ssb/repo/bestbet')
const { ensureArray } = __non_webpack_require__('/lib/ssb/utils/arrayUtils')

exports.get = () => {
  const bestbets = ensureArray(listBestBets(1000))
  if (bestbets) {
    return {
      body: bestbets.map((bet) => {
        return {
          id: bet._id,
          linkedSelectedContentResult: bet.data.linkedSelectedContentResult,
          linkedContentTitle: bet.data.linkedContentTitle,
          linkedContentHref: bet.data.linkedContentHref ? sanitize(bet.data.linkedContentHref) : '',
          linkedContentIngress: bet.data.linkedContentIngress,
          linkedContentType: bet.data.linkedContentType,
          linkedContentDate: bet.data.linkedContentDate,
          linkedContentSubject: bet.data.linkedContentSubject,
          linkedEnglishContentSubject: bet.data.linkedEnglishContentSubject,
          searchWords: ensureArray(bet.data.searchWords),
        }
      }),
    }
  } else return {}
}
exports.post = (req) => {
  const body = JSON.parse(req.body)

  const response = createBestBet({
    id: body.id,
    linkedSelectedContentResult: body.linkedSelectedContentResult,
    linkedContentTitle: body.linkedContentTitle,
    linkedContentHref: body.linkedContentHref,
    linkedContentIngress: body.linkedContentIngress,
    linkedContentType: body.linkedContentType,
    linkedContentDate: body.linkedContentDate,
    linkedContentSubject: body.linkedContentSubject,
    linkedEnglishContentSubject: body.linkedEnglishContentSubject,
    searchWords: body.searchWords,
  })
  return response
}
exports.delete = (req) => {
  return deleteBestBet(req.params.key)
}
