const {
  getComponent
} = __non_webpack_require__( '/lib/xp/portal')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')

exports.get = function(req) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

function renderPart(req) {
  const part = getComponent()
  const props = {
    mathsFormula: part.config.mathsFormula,
    nodeType: part.config.nodeType
  }

  return React4xp.render('site/parts/maths/maths', props, req)
}
