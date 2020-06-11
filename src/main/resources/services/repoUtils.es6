const {
  ensureArray
} = __non_webpack_require__('/lib/ssb/arrayUtils')
const contentType = 'application/json'

export const IDENTITY_FN = (o) => o
export const DEFAULT_FILTER_FN = (o, f) => o

const toOptions = (content, transform) =>
  content.map((item) => transform(item))

export const handleRepoGet = (
  req, repoName, contentFetcher,
  optionTransform = IDENTITY_FN,
  applyFilters = DEFAULT_FILTER_FN
) => {
  try {
    const content = contentFetcher()
    if (!content) {
      const error = `${repoName} StatReg node does not seem to be configured correctly. Unable to retrieve ${repoName}`
      return {
        body: {
          error
        },
        status: 500
      }
    }

    const filtered = applyFilters(ensureArray(content), req.params)
    const options = toOptions(filtered, optionTransform)

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
    log.error(`Error while fetching contacts: ${JSON.stringify(err)}`)
    return {
      contentType,
      body: err,
      status: 500
    }
  }
}

