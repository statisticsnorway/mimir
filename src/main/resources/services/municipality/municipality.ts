import { getMunicipality } from '/lib/ssb/dataset/klass/municipalities'

const contentType = 'application/json'

export function get(req: XP.Request) {
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
