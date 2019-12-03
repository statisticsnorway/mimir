const { list, query } = require('/lib/klass/municipalities')

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

