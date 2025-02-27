import { fetchResultsCristin } from '/lib/ssb/cristin/cristin'

export const get = (req: XP.Request): XP.Response => {
  const per_page: string = req.params.per_page ? req.params.per_page : '10'
  const contributor: string | undefined = req.params.contributor
  const category: string | undefined = req.params.category
  const page: string | undefined = req.params.page
  const sort: string | undefined = req.params.sort

  const results = fetchResultsCristin(contributor, category, per_page, page, sort)

  return {
    body: results,
    contentType: 'application/json',
  }
}
