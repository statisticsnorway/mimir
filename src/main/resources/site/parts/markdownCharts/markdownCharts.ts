import { Request } from 'enonic-types/controller'
import { RepoNode } from 'enonic-types/node'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'

const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')

exports.get = (req: Request): React4xpResponse => {
  return renderPart(req)
}

exports.preview = (req: Request, content: MarkdownRepoNode): React4xpResponse => renderPart(req, content)

function renderPart(req: Request, content?: MarkdownRepoNode): React4xpResponse {
  const options: object = content && content.markdown && content.markdown.chart ? JSON.parse(content.markdown.chart) : {}

  const props: PartProperties = {
    options
  }

  return React4xp.render('site/parts/markdownCharts/markdownCharts', props, req)
}

interface MarkdownRepoNode extends RepoNode {
  markdown?: {
    chart?: string;
  };
}

interface PartProperties {
    options: object;
}
