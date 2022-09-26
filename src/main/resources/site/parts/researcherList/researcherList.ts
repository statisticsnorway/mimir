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
  const researchers = getResearchers()

  const props: PartProps = {
    title: content.displayName,
    researchersList: researchers
  }

  return React4xp.render('site/parts/researcherList/researcherList', props, req)
}

function getResearchers() {
  const results: Array<Content<Employee>> = query({
    start: 0,
    count: 2,
    // sort: 'publish.from DESC',
    // query: `data.isResearcher`,
    contentTypes: [
      `${app.name}:employee`
    ]
  }).hits as unknown as Array<Content<Employee>>
  return results.filter(result => result.data.isResearcher)
}

interface PartProps {
  title: string,
  researchersList: Array<Content<Employee>>,
}
