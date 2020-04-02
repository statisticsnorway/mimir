const highchartController = __non_webpack_require__('../../parts/highchart/highchart')
const dividerController = __non_webpack_require__('../../parts/divider/divider')

exports.macro = function(context) {
  const divider = dividerController.preview(context, {
    dark: false
  })
  const highchart = highchartController.preview(context, context.params.highchart)
  highchart.body = divider.body + highchart.body + divider.body
  return highchart
}
