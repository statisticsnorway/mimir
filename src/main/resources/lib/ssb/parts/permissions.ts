__non_webpack_require__('/lib/ssb/polyfills/nashorn')
import { GetPermissionsResult, PermissionsParams } from 'enonic-types/content'
import { AuthInfo } from 'enonic-types/context'

const {
  getPermissions
} = __non_webpack_require__('/lib/xp/content')
const {
  get: getContext
} = __non_webpack_require__('/lib/xp/context')

export function hasWritePermissionsAndPreview(req: XP.Request, key: string): boolean {
  if (req.mode === 'preview') {
    return hasWritePermissions(key)
  }
  return false
}

export function hasWritePermissions(key: string): boolean {
  const {
    permissions
  }: GetPermissionsResult = getPermissions({
    key
  })
  const userPrincipals: Array<string> = (getContext().authInfo as AuthInfoExtended).principals
  const usersPermissions: Array<PermissionsParams> = permissions.filter((p) => userPrincipals.includes(p.principal))
  return !!usersPermissions.find((permission) => {
    return permission.allow.includes('WRITE_PERMISSIONS') || permission.allow.includes('MODIFY')
  })
}

export interface PermissionsLib {
  hasWritePermissions: (key: string) => boolean;
  hasWritePermissionsAndPreview: (req: XP.Request, key: string) => boolean;
}

interface AuthInfoExtended extends AuthInfo {
  principals: Array<string>;
}
