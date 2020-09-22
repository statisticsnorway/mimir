import { RepoLibrary, RepositoryConfig } from 'enonic-types/lib/repo'
import { RepoCommonLib } from './common'
const repo: RepoLibrary = __non_webpack_require__('/lib/xp/repo')
const {
  withSuperUserContext
}: RepoCommonLib = __non_webpack_require__('/lib/repo/common')

export function getRepo(repoId: string, branch: string): RepositoryConfig | null {
  return withSuperUserContext<RepositoryConfig | null>(repoId, branch, () => {
    return repo.get(repoId)
  })
}

export function repoExists(repoId: string, branch: string): boolean {
  return !!getRepo(repoId, branch)
}

export function createRepo(repoId: string, branch: string): RepositoryConfig {
  return withSuperUserContext<RepositoryConfig>(repoId, branch, () => {
    return repo.create({
      id: repoId
    })
  })
}

export interface RepoLib {
  getRepo: (repoId: string, branch: string) => RepositoryConfig | null;
  repoExists: (repoId: string, branch: string) => boolean;
  createRepo: (repoId: string, branch: string) => RepositoryConfig;
}
