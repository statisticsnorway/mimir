__non_webpack_require__('/lib/ssb/polyfills/nashorn')
import { getPermissions } from '/lib/xp/content'
import { get as getContext, PrincipalKey } from '/lib/xp/context'

export function hasWritePermissionsAndPreview(req: XP.Request, key: string): boolean {
  if (req.mode === 'preview') {
    return hasWritePermissions(key)
  }
  return false
}

// TODO - Test this thoroughly
export function hasWritePermissions(key: string): boolean {
  const { permissions } =
    getPermissions({
      key,
    }) || {}

  if (!permissions) return false

  const userPrincipals = getContext()?.authInfo?.principals
  if (!userPrincipals) return false

  const usersPermissions = permissions.filter((p) => userPrincipals.includes(p.principal as PrincipalKey))
  return !!usersPermissions.find((permission) => {
    return permission.allow?.includes('WRITE_PERMISSIONS') || permission.allow?.includes('MODIFY')
  })
}
