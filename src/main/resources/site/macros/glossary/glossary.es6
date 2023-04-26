import { render } from '/lib/thymeleaf'

const { React4xp } = __non_webpack_require__('/lib/enonic/react4xp')
const { renderError } = __non_webpack_require__('/lib/ssb/error/error')
const view = resolve('./glossary.html')

exports.macro = function (context) {
  try {
    return renderMacro(context)
  } catch (e) {
    return renderError(context.request, 'Error in macro', e)
  }
}

const renderMacro = (context) => {
  if (!context.params.text) throw new Error('Missing param text')
  if (!context.params.explanation) throw new Error('Missing param explanation')

  const glossary = new React4xp('site/macros/glossary/glossary')
    .setProps({
      text: context.params.text,
      explanation: context.params.explanation,
    })
    .setId('glossary')
    .uniqueId()

  const body = render(view, {
    glossaryId: glossary.react4xpId,
  })

  return {
    body: glossary.renderBody({
      body,
    }),
    pageContributions: glossary.renderPageContributions(),
  }
}
