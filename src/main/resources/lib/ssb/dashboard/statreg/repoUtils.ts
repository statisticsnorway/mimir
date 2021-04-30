import { Request, Response } from 'enonic-types/controller'
import { ArrayUtilsLib } from '../../utils/arrayUtils'

const {
  ensureArray
}: ArrayUtilsLib = __non_webpack_require__('/lib/ssb/arrayUtils')
const contentType: string = 'application/json'

function toOptions<T, A>(content: Array<T>, transform: (item: T) => A): Array<A> {
  return content.map((item) => transform(item))
}

export function handleRepoGet<T, A>(
  req: Request,
  repoName: string,
  contentFetcher: () => Array<T>,
  optionTransform: (o: T) => A,
  applyFilters: (o: Array<T>, f: Request['params']) => Array<T>
): Response {
  try {
    const content: Array<T> | T = contentFetcher()
    if (!content) {
      const error: string = `${repoName} StatReg node does not seem to be configured correctly. Unable to retrieve ${repoName}`
      return {
        body: {
          error
        },
        status: 500
      }
    }

    const filtered: Array<T> = applyFilters(ensureArray(content), req.params)
    const options: Array<A> = toOptions(filtered, optionTransform)

    return {
      contentType,
      body: {
        hits: options,
        count: options.length,
        total: options.length
      },
      status: 200
    }
  } catch (err) {
    log.error(`Error while fetching ${repoName}: ${JSON.stringify(err)}`)
    return {
      contentType,
      body: err,
      status: 500
    }
  }
}

