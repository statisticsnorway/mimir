import { getMunicipality } from '/lib/klass/municipalities'

const contentType = 'application/json'

exports.get = function(req) {
  const municipality = getMunicipality({ code: req.params.postalCode })
  const body = { municipality }
  return { body, contentType, status: 200 }
}
