export function responseProcessor(req: XP.Request, res: XP.Response) {
  if (res.status === 200 && res.body) {
    res.body = res.body.replace(
      /<section data-portal-component-type="text">/g,
      '<section class="searchabletext" data-portal-component-type="text">'
    )
  }
  return res
}
