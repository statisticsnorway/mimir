import { Request, Response } from 'enonic-types/controller'
import { Content } from 'enonic-types/content'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')

const {
  getContent
} = __non_webpack_require__('/lib/xp/portal')

const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')


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

export function renderPart(req: Request): React4xpResponse {
  /* collect data */
  const content: Content = getContent()

  /* prepare props */
  const props: ReactProps = {
    title: content.displayName
  }

  return React4xp.render('site/parts/researchEmployeeList/researchEmployeeList', props, req)
}


interface ReactProps {
    title: string;
}

