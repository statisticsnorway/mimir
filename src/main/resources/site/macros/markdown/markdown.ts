import { MacroContext } from 'enonic-types/controller'
import { MarkdownConfig } from './markdown-config'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { Content } from 'enonic-types/content'
import { RepoConnection, RepoNode } from 'enonic-types/node'

const {
  attachmentUrl, pageUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  get
} = __non_webpack_require__('/lib/xp/content')
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  connect
} = __non_webpack_require__('/lib/xp/node')


exports.macro = (context: MacroContext): React4xpResponse => {
  return renderPart(context)
}

exports.preview = (context: MacroContext): React4xpResponse => renderPart(context)

function renderPart(context: MacroContext): React4xpResponse {
  const {
    jsconfig
  } = context.params

  const repo: RepoConnection = connect({
    repoId: 'no.ssb.pubmd',
    branch: 'master',
    principals: ['role:system.admin']
  })
  const content: RepoNode = repo.get(jsconfig)

  log.info(JSON.stringify(content, null, 2))

  const props: PartProperties = {
    content
  }

  return React4xp.render('site/macros/markdown/markdown', props)
}

interface PartProperties {
    content: RepoNode;
}
