import { sanitize } from '/lib/xp/common'
import { listBestBets, createBestBet, deleteBestBet } from '/lib/ssb/repo/bestbet'
import { ensureArray } from '/lib/ssb/utils/arrayUtils'
import { type BestBetContent } from '/lib/types/bestebet'

export function get() {
  const bestbets = ensureArray(listBestBets(1000))
  if (bestbets) {
    return {
      body: bestbets.map((_bet) => {
        const bet = _bet as unknown as { _id: string; data: BestBetContent }
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
export function post(req: XP.Request) {
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
function del(req: XP.Request) {
  return deleteBestBet(req.params.key)
}
export { del as delete }
