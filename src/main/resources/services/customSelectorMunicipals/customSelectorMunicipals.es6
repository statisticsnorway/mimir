const { list, query } = __non_webpack_require__('/lib/ssb/dataset/klass/municipalities')

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
  // deepcode ignore Sqli: This is not SQL, simply string regex matching
  const municipals = req.params.query ? query(req.params.query) : list(req.params.count)

  return {
    body: {
      total: municipals.length,
      count: municipals.length,
      hits: municipals.map((municipal) => ({
        id: municipal.code,
        displayName: `${municipal.code} ${municipal.name}`,
        description: `${municipal.shortName} ${municipal.presentationName}`,
      })),
    },
  }
}
