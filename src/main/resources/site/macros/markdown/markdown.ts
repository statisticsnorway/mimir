import { MacroContext, Request } from 'enonic-types/controller'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { RepoConnection, RepoNode } from 'enonic-types/node'

const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  connect
} = __non_webpack_require__('/lib/xp/node')
const {
  preview
} = __non_webpack_require__('../../parts/markdownCharts/markdownCharts')

exports.macro = (context: MacroContext): React4xpResponse => renderPart(context)

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

  return preview(context as unknown as Request, content)
}
