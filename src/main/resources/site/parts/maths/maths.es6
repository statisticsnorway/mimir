
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

exports.preview = (req, id) => renderPart(req, [id])

const props = {
  content: 'testinnhold'
}

function renderPart(req) {
  return React4xp.render('site/parts/maths/maths', props, req)
}
