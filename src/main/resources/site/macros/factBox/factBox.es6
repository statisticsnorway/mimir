const factBoxController = __non_webpack_require__(`../../parts/factBox/factBox`)

const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')

exports.macro = function(context) {
  try {
    const factBox = factBoxController.preview(context, context.params)

    if (factBox.status && factBox.status !== 200) throw new Error(`factBox with id ${context.params.factBox} missing`)

    return factBox
  } catch (e) {
    return renderError(context.request, 'Error in macro', e)
  }
}
