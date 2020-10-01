const {
  getComponent
} = __non_webpack_require__( '/lib/xp/portal')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')

exports.get = function(req) {
  try {
    const part = getComponent()
    return renderPart(req, part)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req, part) => renderPart(req, part)

function renderPart(req, part) {
  const props = {
    mathsFormula: part.config.mathsFormula,
    nodeType: part.config.nodeType
  }

  return React4xp.render('site/parts/maths/maths', props, req)
}
