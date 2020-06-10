const {
  list, query
} = __non_webpack_require__('/lib/klass/municipalities')

/**
 * @param {object} req: Enonics request object
 * @return {{body:
 *  {hits: {
 *    id: string,
 *    displayName: string,
 *    description: string },
 *  total: number,
 *  count: number}
 * }}
 */
exports.get = (req) => {
  const municipals = req.params.query ? query(req.params.query) : list(req.params.count)

  return {
    body: {
      total: municipals.length,
      count: municipals.length,
      hits: municipals.map((municipal) => ({
        id: municipal.code,
        displayName: `${municipal.code} ${municipal.name}`,
        description: `${municipal.shortName} ${municipal.presentationName}`
      }))
    }
  }
}

