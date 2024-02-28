import { React4xp } from '/lib/enonic/react4xp'
import { renderError } from '/lib/ssb/error/error'
import { Glossary } from '.'

export function macro(context: XP.MacroContext<Glossary>) {
  try {
    return renderMacro(context)
  } catch (e) {
    return renderError(context.request, 'Error in macro', e)
  }
}

const renderMacro = (context: XP.MacroContext<Glossary>) => {
  const { text, explanation } = context.params

  if (!text) throw new Error('Missing param text')
  if (!explanation) throw new Error('Missing param explanation')

  const glossary = new React4xp('site/macros/glossary/glossary')
    .setProps({
      text,
      explanation,
    })
    .uniqueId()

  return {
    body: glossary.renderBody({
      body: `<span class="macro-glossary" id="${glossary.react4xpId}"></span>`,
      request: context.request,
    }),
    pageContributions: glossary.renderPageContributions({
      request: context.request,
    }),
  }
}
