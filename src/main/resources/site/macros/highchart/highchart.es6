const highchartController = __non_webpack_require__('../../parts/highchart/highchart')
const dividerController = __non_webpack_require__('../../parts/divider/divider')

const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')

exports.macro = function(context) {
  try {
    const divider = dividerController.preview(context, {
      dark: false
    })

    const highchart = highchartController.preview(context, context.params.highchart)

    if (highchart.status && highchart.status !== 200) throw new Error(`Highchart with id ${context.params.highchart} missing`)
    highchart.body = divider.body + highchart.body + divider.body

    return highchart
  } catch (e) {
    return renderError(context.request, 'Error in macro', e)
  }
}
