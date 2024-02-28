import { list, query } from '/lib/ssb/dataset/klass/municipalities'

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
export function get(req: XP.Request) {
  // deepcode ignore Sqli: This is not SQL, simply string regex matching
  const municipals = req.params.query ? query(req.params.query) : list()

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
