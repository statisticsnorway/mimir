const { render } = __non_webpack_require__('/lib/enonic/react4xp')
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

  const props = {
    text,
    explanation,
  }

  const react4xpId = `r4x-${(78364164096 + Math.floor(Math.random() * 2742745743360)).toString(36)}` // From lib-react4xp; used to generate uniqueId
  return render('site/macros/glossary/glossary', props, context.request, {
    id: react4xpId,
    body: `<span id="${react4xpId}"></span>`,
    ssr: context.request.mode === 'edit', // Component has to be clientside rendered so it doesn't get inserted twice
  })
}
