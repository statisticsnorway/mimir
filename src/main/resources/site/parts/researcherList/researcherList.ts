import { Request, Response } from 'enonic-types/controller'
import { Component } from 'enonic-types/portal'
import { ResearcherListPartConfig } from './researcherList-part-config'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { Content } from 'enonic-types/content'
import { renderError } from '../../../lib/ssb/error/error'

const {
  getContent, getComponent
} = __non_webpack_require__('/lib/xp/portal')
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
  const component: Component<ResearcherListPartConfig> = getComponent()
  
  const props: PartProps = {
    title: content.displayName
  }

  return React4xp.render('site/parts/researcherList/researcherList', props, req)
}


interface PartProps {
  title: string;
}
