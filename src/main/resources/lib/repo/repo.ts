import { ContextLibrary } from 'enonic-types/lib/context'
import { RepoLibrary, RepositoryConfig } from 'enonic-types/lib/repo'

const context: ContextLibrary = __non_webpack_require__('/lib/xp/context')
const repo: RepoLibrary = __non_webpack_require__('/lib/xp/repo')


function getRepoInContext(repoId: string, branchName: string): RepositoryConfig | null{
  return context.run({
    repository: repoId,
    branch: branchName,
    user: {
      login: 'su',
      idProvider: 'system'
    }
  }, function() {
    return repo.get(repoId)
  })
}

export function repoExisits(repoId: string, branchName: string): boolean {
  const repoContent: RepositoryConfig | null = getRepoInContext(repoId, branchName)
  return !!repoContent
}

function createRepoInContext(repoId: string, branchName: string): RepositoryConfig {
  return context.run({
    repository: repoId,
    branch: branchName,
    user: {
      login: 'su',
      idProvider: 'system'
    }
  }, function() {
    return repo.create({
      id: repoId
    })
  })
}

export function createRepo(repoId: string, branchName: string): RepositoryConfig {
    const createRepoResult: RepositoryConfig | null = createRepoInContext(repoId, branchName)
    return createRepoResult
}
