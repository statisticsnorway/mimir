import { Request, Response } from 'enonic-types/controller'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { Content, QueryResponse } from 'enonic-types/content'
import { renderError } from '../../../lib/ssb/error/error'
import { Employee } from '../../content-types/employee/employee'

const {
  getContent
} = __non_webpack_require__('/lib/xp/portal')
const {
  query
} = __non_webpack_require__('/lib/xp/content')
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')

exports.get = (req: Request): React4xpResponse | Response => {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: Request): React4xpResponse => renderPart(req)

function renderPart(req: Request): React4xpResponse {
  const content: Content = getContent()
  const researchers: any = getResearchers()

  const props: iPartProps = {
    title: content.displayName,
    researchers
  }

  return React4xp.render('site/parts/researcherList/researcherList', props, req)
}

function getResearchers() {
  const results: Array<Content<Employee>> = query({
    start: 0,
    count: 20,
    sort: 'publish.from DESC',
    // query: `data.isResearcher`,
    contentTypes: [
      `${app.name}:employee`
    ]
  }).hits as unknown as Array<Content<Employee>>
  return results.map(result => {
    if (result.data.isResearcher) {
      return {
        surname: result.data.surname,
        name: result.data.name,
        position: result.data.position,
        path: result._path,
        phone: result.data.phone,
        email: result.data.email,
        area: result.data.area,
      }
    }
    return
  })
}

interface iPartProps {
  title: string,
  researchers: Array<iResearcher>,
}

interface iResearcher {
  surname: string,
  name: string,
  position: string,
  path: string,
  phone: string,
  email: string,
  area: string,
}
