import { get, create, createBranch as createRepoBranch, type Repository, BranchResult } from '/lib/xp/repo'
const { withSuperUserContext } = __non_webpack_require__('/lib/ssb/repo/common')

export function getRepo(repoId: string, branch: string) {
  return withSuperUserContext<Repository | null>(repoId, branch, () => {
    return get(repoId)
  })
}

export function repoExists(repoId: string, branch: string): boolean {
  return !!getRepo(repoId, branch)
}

export function createRepo(repoId: string, branch: string): Repository {
  return withSuperUserContext<Repository>(repoId, branch, () => {
    return create({
      id: repoId,
    })
  })
}

export function createBranch(repoId: string, branchId: string): BranchResult {
  return withSuperUserContext(repoId, branchId, () => {
    return createRepoBranch({
      branchId,
      repoId,
    })
  })
}

export interface RepoLib {
  getRepo: (repoId: string, branch: string) => Repository | null
  repoExists: (repoId: string, branch: string) => boolean
  createRepo: (repoId: string, branch: string) => Repository
  createBranch: (repoId: string, branchId: string) => BranchResult
}
