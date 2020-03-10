const test = __non_webpack_require__('/lib/xp/testing')
const utils = __non_webpack_require__( '/lib/ssb/utils')

exports.testHumanReadableNumber1 = function() {
  const result = utils.createHumanReadableFormat(123456789)
  test.assertEquals('123\u00a0456\u00a0789', result, 'En test streng GLNRBN')
}

exports.testHumanReadableNumber2 = function() {
  const result = utils.createHumanReadableFormat(1249554)
  test.assertEquals('1\u00a0249\u00a0554', result, 'En test streng GLNRBN')
}
