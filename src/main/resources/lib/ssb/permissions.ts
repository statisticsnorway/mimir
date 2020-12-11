__non_webpack_require__('/lib/polyfills/nashorn')
import { ContentLibrary, GetPermissionsResult, PermissionsParams } from 'enonic-types/content'
import { AuthInfo, ContextLibrary } from 'enonic-types/context'
import { Request } from 'enonic-types/controller'

const {
  getPermissions
}: ContentLibrary = __non_webpack_require__( '/lib/xp/content')
const {
  get: getContext
}: ContextLibrary = __non_webpack_require__( '/lib/xp/context')

export function hasWritePermissions(req: Request, key: string): boolean {
  if (req.mode === 'preview') {
    const {
      permissions
    }: GetPermissionsResult = getPermissions({
      key
    })
    const userPrincipals: Array<string> = (getContext().authInfo as AuthInfoExtended).principals
    const usersPermissions: Array<PermissionsParams> = permissions.filter((p) => userPrincipals.includes(p.principal))
    return !!usersPermissions.find((permission) => {
      return permission.allow.includes('WRITE_PERMISSIONS')
    })
  }
  return false
}

interface AuthInfoExtended extends AuthInfo {
  principals: Array<string>;
}
