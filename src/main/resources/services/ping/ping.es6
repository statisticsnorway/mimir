const {
  getVersion
} = __non_webpack_require__('/lib/xp/admin')

export function get(req) {
  const contentType = 'application/xml'
  const body = `<ping>
            <version>${getVersion()}</version>
</ping > `
  return {
    body,
    contentType,
    status: 200
  }
}
