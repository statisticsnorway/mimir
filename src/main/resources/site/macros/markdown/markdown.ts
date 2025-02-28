import { connect } from '/lib/xp/node'
import { type MarkdownRepoNode } from '/lib/ssb/utils/markdownUtils'
import { preview as markdownChartsPreview } from '../../parts/markdownCharts/markdownCharts'

export function macro(context: XP.MacroContext): XP.Response {
  return renderPart(context)
}

export function preview(context: XP.MacroContext): XP.Response {
  return renderPart(context)
}

function renderPart(context: XP.MacroContext): XP.Response {
  const { jsconfig } = context.params

  const repo = connect({
    repoId: 'no.ssb.pubmd',
    branch: 'master',
    principals: ['role:system.admin'],
  })
  const content = repo.get(jsconfig)

  return markdownChartsPreview(context as unknown as XP.Request, content as MarkdownRepoNode)
}
