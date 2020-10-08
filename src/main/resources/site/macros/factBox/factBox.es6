const controller = __non_webpack_require__(`../../parts/factBox/factBox`)

exports.macro = function(context) {
  return controller.preview(context, context.params.factBox)
}
