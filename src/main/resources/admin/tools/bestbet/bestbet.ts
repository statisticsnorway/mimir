import { Request, Response } from 'enonic-types/controller'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'

const {
  assetUrl, serviceUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')


exports.get = function(req: Request): React4xpResponse | Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: Request): React4xpResponse | Response => {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

interface BestbetProps {
    value: string;
    list: string;
    model: string;

}

function renderPart(req: Request): React4xpResponse | Response {
  const props: BestbetProps = {
    value: 'test'
    list: serviceUrl({
      service: 'bestBetList'
    })
    model: serviceUrl({
      service: 'bestBetModel'
    })
  }

  return React4xp.render('bestbet/Bestbet', props, req)
}
