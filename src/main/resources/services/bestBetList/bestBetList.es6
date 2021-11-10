
const {
  listBestBets,
  createBestBet
} = __non_webpack_require__('/lib/ssb/repo/bestbet')
const {ensureArray} = __non_webpack_require__('/lib/ssb/utils/arrayUtils')



/**
 * @param {object} req: Enonics request object
 * @return {{body:
 *  {bestbets: {
 *    id: string,
 *    linkedContentId: string,
 *    searchWords: Array<string> },
 *  total: number,
 *  count: number}
 * }}
 */
exports.get = () => {
  const bestbets = ensureArray(listBestBets(100))
  if(bestbets){
  return {
    body: {
      // total: bestbets.total,
      count: bestbets.length,
      hits: bestbets.map((bet) => ({
        id: bet._id,
        linkedContentId: bet.linkedContentId,
        searchWords: bet.searchWords
      })
      )
    }
  }
  }
  else return {}
}
exports.post = (req) => {
  const body = JSON.parse(req.body)
  const response = createBestBet(body.linkedContentId, body.searchWords)
  return response
}
