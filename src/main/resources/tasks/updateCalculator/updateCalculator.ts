
const {
  updateCalculator
} = __non_webpack_require__('/lib/ssb/dataset/calculator')

exports.run = function(): void {
  log.info(`Run Task updateCalculator: ${new(Date)}`)
  updateCalculator()
}

