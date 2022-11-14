const accordionController = __non_webpack_require__('../../parts/accordion/accordion')
const {
  data: { forceArray },
} = __non_webpack_require__('/lib/util')

exports.macro = function (context) {
  const accordionIds = context.params.accordion ? forceArray(context.params.accordion) : []
  return accordionController.preview(context, accordionIds)
}
