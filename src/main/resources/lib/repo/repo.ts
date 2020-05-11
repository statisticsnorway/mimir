import { RepoLibrary, RepositoryConfig } from 'enonic-types/lib/repo'
import { withSuperUserContext } from './common';

const repo: RepoLibrary = __non_webpack_require__('/lib/xp/repo')

export function getRepo(repoId: string, branch: string): RepositoryConfig | null {
  return withSuperUserContext<RepositoryConfig | null>(repoId, branch, () => {
    return repo.get(repoId)
  })
};

export function repoExists(repoId: string, branch: string): boolean {
  return !!getRepo(repoId, branch)
};

export function createRepo(repoId: string, branch: string): RepositoryConfig {
  return withSuperUserContext<RepositoryConfig>(repoId, branch, () => {
    return repo.create({
      id: repoId
    })
  })
}
