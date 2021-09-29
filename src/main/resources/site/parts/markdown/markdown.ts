import { Request } from 'enonic-types/controller'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { Component } from 'enonic-types/portal'
import { MarkdownPartConfig } from './markdown-part-config'
import { Content } from 'enonic-types/content'

const {
  get,
  getChildren
} = __non_webpack_require__('/lib/xp/content')
const {
  getComponent
} = __non_webpack_require__('/lib/xp/portal')
const {
  render
} = __non_webpack_require__('/lib/markdown')

const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')

exports.get = (req: Request): React4xpResponse => {
  return renderPart(req)
}

exports.preview = (req: Request): React4xpResponse => renderPart(req)

function renderPart(req: Request): React4xpResponse {
  const component: Component<MarkdownPartConfig> = getComponent()
  const markdownText: string = component.config.markdownText ? render(component.config.markdownText) : ''

  const markdownFileContent: MarkdownContent | null = component.config.markdownFile ? get({
    key: component.config.markdownFile
  }) : null
  const markdownFileChildren: Array<object> | undefined = markdownFileContent ? getChildren({
    key: markdownFileContent._path,
    count: 100
  }) as unknown as Array<object> : undefined
  log.info('markdown children %s', JSON.stringify(markdownFileChildren, null, 2))

  const props: PartProperties = {
    markdownText: markdownFileContent && markdownFileContent.markdown ? markdownText.concat(render(markdownFileContent.markdown)) : markdownText
  }

  return React4xp.render('site/parts/markdown/markdown', props, req)
}

interface MarkdownContent extends Content {
  markdown?: string;
}

interface PartProperties {
    markdownText: string;
}
