import { MacroContext } from 'enonic-types/controller'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { RepoConnection, RepoNode } from 'enonic-types/node'
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  connect
} = __non_webpack_require__('/lib/xp/node')


exports.macro = (context: MacroContext): React4xpResponse => {
  log.info('GLNRBN reached markdown macro!')
  return renderPart(context)
}

exports.preview = (context: MacroContext): React4xpResponse => renderPart(context)

function renderPart(context: MacroContext): React4xpResponse {
  // const {
  //   jsconfig
  // } = context.params

  // const repo: RepoConnection = connect({
  //   repoId: 'no.ssb.pubmd',
  //   branch: 'master',
  //   principals: ['role:system.admin']
  // })
  // const content: ContentProperties = repo.get(jsconfig)

  const props: PropProps = {
    content: 'teststring her'
  }

  // log.info(JSON.stringify(content, null, 2))

  return React4xp.render('site/macros/markdown/markdown', props)
}

// interface PartProperties {
//     content: RepoNode;
// }

// interface ContentProperties extends PartProperties {
//   markdown: string;
// }

interface PropProps {
  content: string;
}
