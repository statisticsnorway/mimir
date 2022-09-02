import { Content } from 'enonic-types/content'
import { Request, Response } from 'enonic-types/controller'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { Employee } from '../../content-types/employee/employee'


const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const {
  getContent
} = __non_webpack_require__('/lib/xp/portal')

exports.get = function(req: Request): React4xpResponse | Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part: ', e)
  }
}

exports.preview = (req: Request): React4xpResponse | Response => renderPart(req)

function renderPart(req: Request): React4xpResponse {
  const page: Content<Employee> = getContent()
  const props: EmployeeProp = {
    title: page.displayName
  }

  return React4xp.render('site/parts/employee/employee', props, req)
}

interface EmployeeProp {
  title: string;
}
