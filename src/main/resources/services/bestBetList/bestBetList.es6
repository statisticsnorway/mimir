
const {
  listBestBets,
  createBestBet
} = __non_webpack_require__('/lib/ssb/repo/bestbet')



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
exports.get = (req) => {
  const bestbets = listBestBets()
  log.info('GLNRBN: ' + JSON.stringify(listBestBets, null, 2))
  if(!!bestbets){
  return {
    body: {
      total: bestbets.length,
      count: bestbets.length,
      bestbets: bestbets.map((bestBet) => ({
        id: bestBet._id,
        linkedContentId: bestBet.linkedContentId,
        searchWords: bestBet.searchWords
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
