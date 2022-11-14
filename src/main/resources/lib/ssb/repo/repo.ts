import { get, create, createBranch as createRepoBranch, BranchConfig, RepositoryConfig } from '/lib/xp/repo'
const { withSuperUserContext } = __non_webpack_require__('/lib/ssb/repo/common')

export function getRepo(repoId: string, branch: string): RepositoryConfig | null {
  return withSuperUserContext<RepositoryConfig | null>(repoId, branch, () => {
    return get(repoId)
  })
}

export function repoExists(repoId: string, branch: string): boolean {
  return !!getRepo(repoId, branch)
}

export function createRepo(repoId: string, branch: string): RepositoryConfig {
  return withSuperUserContext<RepositoryConfig>(repoId, branch, () => {
    return create({
      id: repoId,
    })
  })
}

export function createBranch(repoId: string, branchId: string): BranchConfig {
  return withSuperUserContext(repoId, branchId, () => {
    return createRepoBranch({
      branchId,
      repoId,
    })
  })
}

export interface RepoLib {
  getRepo: (repoId: string, branch: string) => RepositoryConfig | null
  repoExists: (repoId: string, branch: string) => boolean
  createRepo: (repoId: string, branch: string) => RepositoryConfig
  createBranch: (repoId: string, branchId: string) => BranchConfig
}
