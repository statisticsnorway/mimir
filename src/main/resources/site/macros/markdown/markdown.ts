import { connect } from '/lib/xp/node'
import { preview } from '../../parts/markdownCharts/markdownCharts'

exports.macro = (context: XP.MacroContext): XP.Response => renderPart(context)

exports.preview = (context: XP.MacroContext): XP.Response => renderPart(context)

function renderPart(context: XP.MacroContext): XP.Response {
  const { jsconfig } = context.params

  const repo = connect({
    repoId: 'no.ssb.pubmd',
    branch: 'master',
    principals: ['role:system.admin'],
  })
  const content = repo.get(jsconfig)

  return preview(context as unknown as Request, content)
}
