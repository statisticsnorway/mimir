import { Request, Response } from 'enonic-types/controller'
import { RepoNode } from 'enonic-types/node'
import { renderError } from '../../../lib/ssb/error/error'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'

const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')

exports.get = (req: Request): React4xpResponse | Response => {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in markdownCharts part: ', e)
  }
}

exports.preview = (req: Request, content: MarkdownRepoNode): React4xpResponse | Response => {
  try {
    return renderPart(req, content)
  } catch (e) {
    return renderError(req, 'Error in markdownCharts part: ', e)
  }
}

function renderPart(req: Request, content?: MarkdownRepoNode): React4xpResponse {
  const options: object = content && content.markdown ? JSON.parse(content.markdown) : {}

  const props: PartProperties = {
    options
  }

  return React4xp.render('site/parts/markdownCharts/markdownCharts', props, req)
}

interface MarkdownRepoNode extends RepoNode {
  markdown?: string;
}

interface PartProperties {
    options: object;
}
