import { Request } from 'enonic-types/controller'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { Component } from 'enonic-types/portal'
import { MarkdownPartConfig } from './markdown-part-config'

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

  const props: PartProperties = {
    markdownText: markdownText
  }

  return React4xp.render('site/parts/markdown/markdown', props, req)
}

interface PartProperties {
    markdownText: string;
}
