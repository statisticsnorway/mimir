const { getMunicipality } = __non_webpack_require__('/lib/ssb/dataset/klass/municipalities')

const contentType = 'application/json'

exports.get = function (req) {
  const municipality = getMunicipality({
    code: req.params.postalCode,
  })
  const body = {
    municipality,
  }
  return {
    body,
    contentType,
    status: 200,
  }
}
