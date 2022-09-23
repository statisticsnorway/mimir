import { Request, Response } from 'enonic-types/controller'
import { Component } from 'enonic-types/portal'
import { ResearcherListPartConfig } from './researcherList-part-config'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { Content } from 'enonic-types/content'
import { fromPartCache } from '../../../lib/ssb/cache/partCache'
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
  if (req.mode === 'edit' || req.mode === 'inline') {
    return getResearcherList(req, content)
  } else {
    return fromPartCache(req, `${content._id}-researcherList`, () => getResearcherList(req, content))
  }
}

function getResearcherList(req: Request, content: Content): React4xpResponse {
  const component: Component<ResearcherListPartConfig> = getComponent()

  const props: PartProperties = {
    title: "tester"
  }

  return React4xp.render('site/parts/researcherList/researcherList', props, req)
}

interface PartProperties {
  title: string;
}
