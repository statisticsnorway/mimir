import { render } from '/lib/thymeleaf'

export interface ErrorInterface {
  errorTitle: string
  errorBody: string
}

const errorView = resolve('./error.html')

export function renderError(req: XP.Request, title: string, exception: Error): XP.Response {
  const model: ErrorInterface = {
    errorBody: exception?.message ?? '',
    errorTitle: title,
  }

  log.error(`${title}: ${exception?.stack}`)

  const body: string =
    req?.mode && (req.mode === 'edit' || req.mode === 'preview' || req.mode === 'inline')
      ? render(errorView, model)
      : ''

  return {
    body,
    contentType: 'text/html',
    status: 400,
  }
}
