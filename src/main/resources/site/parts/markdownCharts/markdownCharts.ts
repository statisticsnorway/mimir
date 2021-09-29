import { Request } from 'enonic-types/controller'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'

const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')

exports.get = (req: Request): React4xpResponse => {
  return renderPart(req)
}

exports.preview = (req: Request): React4xpResponse => renderPart(req)

function renderPart(req: Request): React4xpResponse {
  const props: PartProperties = {
    content: '!teststreng'
  }

  return React4xp.render('site/parts/markdownCharts/markdownCharts', props, req)
}

interface PartProperties {
    content: string;
}
