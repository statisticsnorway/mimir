import { React4xp } from '/lib/enonic/react4xp'

const { renderError } = __non_webpack_require__('/lib/ssb/error/error')

exports.macro = function (context: XP.MacroContext) {
  try {
    return renderMacro(context)
  } catch (e) {
    return renderError(context.request, 'Error in macro', e)
  }
}

const renderMacro = (context: XP.MacroContext) => {
  const { text, explanation } = context.params

  if (!text) throw new Error('Missing param text')
  if (!explanation) throw new Error('Missing param explanation')

  const glossary = new React4xp('site/macros/glossary/glossary')
    .setProps({
      text,
      explanation,
    })
    .uniqueId()

  // Component has to be clientside rendered so it doesn't get inserted twice
  const isInEditMode = context.request.mode === 'edit'
  return {
    body: glossary.renderBody({
      body: `<span class="macro-glossary" id="${glossary.react4xpId}"></span>`,
      request: context.request,
      ssr: isInEditMode,
    }),
    pageContributions: glossary.renderPageContributions({
      request: context.request,
      ssr: isInEditMode,
    }),
  }
}
