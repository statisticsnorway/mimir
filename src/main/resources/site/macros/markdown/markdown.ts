import { MacroContext } from 'enonic-types/controller'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { RepoConnection, RepoNode } from 'enonic-types/node'
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  connect
} = __non_webpack_require__('/lib/xp/node')

// eslint-disable-next-line @typescript-eslint/typedef
const highchartController = __non_webpack_require__('../../parts/markdownCharts/markdownCharts')


exports.macro = (context: MacroContext): React4xpResponse => {
  log.info('GLNRBN reached markdown macro!')
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

  // eslint-disable-next-line @typescript-eslint/typedef
  const highchart = highchartController.preview(context, content)
  return highchart

  // log.info(JSON.stringify(content, null, 2))

  // const props: PartProperties = {
  //   content
  // }

  // return React4xp.render('site/macros/markdown/markdown', props)
}

interface PartProperties {
    content: RepoNode;
}
