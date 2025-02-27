import { getVersion } from '/lib/xp/admin'

export function get() {
  const contentType = 'application/xml'
  const body = `<ping>
            <version>${app.version}</version>
            <XPversion>${getVersion()}</XPversion>
</ping > `
  return {
    body,
    contentType,
    status: 200,
  }
}
