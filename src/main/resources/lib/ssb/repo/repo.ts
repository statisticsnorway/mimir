import { get, create, createBranch as createRepoBranch, type Repository, BranchResult } from '/lib/xp/repo'
import { withSuperUserContext } from '/lib/ssb/repo/common'

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
