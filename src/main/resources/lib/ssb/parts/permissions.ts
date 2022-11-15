__non_webpack_require__('/lib/ssb/polyfills/nashorn')
import { getPermissions, GetPermissionsResult, PermissionsParams } from '/lib/xp/content'
import { get as getContext } from '/lib/xp/context'

export function hasWritePermissionsAndPreview(req: XP.Request, key: string): boolean {
  if (req.mode === 'preview') {
    return hasWritePermissions(key)
  }
  return false
}

export function hasWritePermissions(key: string): boolean {
  const { permissions }: GetPermissionsResult = getPermissions({
    key,
  })
  const userPrincipals: ReadonlyArray<string> = getContext().authInfo.principals
  const usersPermissions: Array<PermissionsParams> = permissions.filter((p) => userPrincipals.includes(p.principal))
  return !!usersPermissions.find((permission) => {
    return permission.allow.includes('WRITE_PERMISSIONS') || permission.allow.includes('MODIFY')
  })
}

export interface PermissionsLib {
  hasWritePermissions: (key: string) => boolean
  hasWritePermissionsAndPreview: (req: XP.Request, key: string) => boolean
}
