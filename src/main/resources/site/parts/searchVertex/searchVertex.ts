import { render } from '/lib/thymeleaf'

export function get(req: XP.Request): XP.Response {
  const view = resolve('searchVertex.html')
  const model = {
    test: 'test',
    req: req,
  }
  const body = render(view, model)
  return { body }
}
