const test = __non_webpack_require__('/lib/xp/testing')
const counties = __non_webpack_require__( '/lib/klass/counties')

exports.testString = function() {
  const result = counties.testingCgn()
  test.assertEquals('Hei Carina', result, 'OKCOMPUTER')
}
