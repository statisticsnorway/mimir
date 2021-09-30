import { Request, Response } from 'enonic-types/controller'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { Component } from 'enonic-types/portal'
import { MarkdownPartConfig } from './markdown-part-config'
import { Content } from 'enonic-types/content'
import { renderError } from '../../../lib/ssb/error/error'

const {
  getMarkdownNode
} = __non_webpack_require__('/lib/ssb/utils/markdownUtils')
const {
  getComponent, processHtml
} = __non_webpack_require__('/lib/xp/portal')
const {
  render
} = __non_webpack_require__('/lib/markdown')

const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')

exports.get = (req: Request): React4xpResponse | Response => {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in markdown part: ', e)
  }
}

exports.preview = (req: Request): React4xpResponse | Response => {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in markdown part: ', e)
  }
}

function renderPart(req: Request): React4xpResponse {
  const component: Component<MarkdownPartConfig> = getComponent()
  const markdownTextProcessed: string = processHtml({
    value: component.config.markdownText ? component.config.markdownText : ''
  })
  const markdownTextRendered: string = render(markdownTextProcessed)

  const markdownFileContent: MarkdownContent | null = component.config.markdownFile ? getMarkdownNode(component.config.markdownFile) : null
  const markdownFileProcessed: string = processHtml({
    value: markdownFileContent?.markdown ? markdownFileContent.markdown : ''
  })

  const props: PartProperties = {
    markdownText: markdownFileContent && markdownFileContent.markdown ? markdownTextRendered.concat(render(markdownFileProcessed)) : markdownTextRendered
  }

  return React4xp.render('site/parts/markdown/markdown', props, req)
}

interface MarkdownContent extends Content {
  markdown?: string;
}

interface PartProperties {
    markdownText: string;
}
