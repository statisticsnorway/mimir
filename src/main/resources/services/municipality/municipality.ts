import { type Request } from '@enonic-types/core'
import { getMunicipality } from '/lib/ssb/dataset/klass/municipalities'
import { type RequestWithCode } from '/lib/types/municipalities'

const contentType = 'application/json'

export function get(req: Request) {
  const municipality = getMunicipality({
    code: req.params?.postalCode?.toString(),
  } as RequestWithCode)
  const body = {
    municipality,
  }
  return {
    body,
    contentType,
    status: 200,
  }
}
