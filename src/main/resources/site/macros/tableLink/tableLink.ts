import { pageUrl } from '/lib/xp/portal'
import { render } from '/lib/thymeleaf'

import { React4xp } from '/lib/enonic/react4xp'
import { renderError } from '/lib/ssb/error/error'
import { TableLink } from '.'

const view = resolve('./tableLink.html')

export function macro(context: XP.MacroContext<TableLink>) {
  try {
    return renderMacro(context)
  } catch (e) {
    return renderError(context.request, 'Error in macro', e)
  }
}

const renderMacro = (context: XP.MacroContext<TableLink>) => {
  const linkSrc = context.params.relatedContent
    ? pageUrl({
        id: context.params.relatedContent,
      })
    : context.params.href

  if (!context.params.title) throw new Error('Missing param title')
  if (!linkSrc) throw new Error('Missing param Url or relatedContent')
  if (!context.params.description) throw new Error('Missing param description')

  const tableLink = new React4xp('site/macros/tableLink/tableLink')
    .setProps({
      title: context.params.title,
      href: linkSrc,
      description: context.params.description,
    })
    .setId('tableLink')
    .uniqueId()

  const body = render(view, {
    tableLinkId: tableLink.react4xpId,
  })

  return {
    body: tableLink.renderBody({
      body,
      request: context.request,
    }),
    pageContributions: tableLink.renderPageContributions({
      request: context.request,
    }),
  }
}
