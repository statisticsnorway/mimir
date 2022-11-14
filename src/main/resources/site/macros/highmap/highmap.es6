const highmapController = __non_webpack_require__('../../parts/highmap/highmap')

const { renderError } = __non_webpack_require__('/lib/ssb/error/error')

exports.macro = function (context) {
  try {
    const highmap = highmapController.preview(context, context.params.highmap)

    if (highmap.status && highmap.status !== 200) throw new Error(`Highmap with id ${context.params.highmap} missing`)

    return highmap
  } catch (e) {
    return renderError(context.request, 'Error in macro', e)
  }
}
