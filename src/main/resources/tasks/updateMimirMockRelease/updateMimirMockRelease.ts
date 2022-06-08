const {
  updateMimirMockRelease
} = __non_webpack_require__('/lib/ssb/repo/statreg')

exports.run = function(): void {
  log.info(`Run Task updateMimirMockRelease: ${new(Date)}`)
  updateMimirMockRelease()
}
