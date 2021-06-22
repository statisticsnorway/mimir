import { Request } from 'enonic-types/controller'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'

const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')

exports.get = (req: Request): React4xpResponse => {
  return renderPart(req)
}

exports.preview = (req: Request): React4xpResponse => renderPart(req)

function renderPart(req: Request): React4xpResponse {
  const testCrumbs: Array<object> = [{
    text: 'Forsiden',
    link: '/'
  }, {
    text: 'Statistikkbanken',
    link: '/statbank'
  }]

  const props: PartProperties = {
    title: 'Statistikkbanken',
    breadcrumb: testCrumbs
  }

  return React4xp.render('site/parts/statbankFrame/statbankFrame', props, req)
}

interface PartProperties {
    title: string;
    breadcrumb: Array<object>;
}
