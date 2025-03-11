import { connectMarkdownRepo } from '/lib/ssb/utils/markdownUtils'

export const post = (req: XP.Request): XP.Response => {
  const createContentParams = {
    displayName: req.params.name,
    markdown: req.params.markdown,
  }

  const conn = connectMarkdownRepo()

  const createdContent = conn.create(createContentParams)

  return {
    status: 200,
    body: createdContent,
  }
}
