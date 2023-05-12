import { render } from '/lib/thymeleaf'

export interface ErrorInterface {
  errorTitle: string
  errorBody: string
  errorLog: void
}

const errorView = resolve('./error.html')

export function renderError(req: XP.Request, title: string, exception: Error): XP.Response {
  const model: ErrorInterface = {
    errorBody: exception.message,
    errorTitle: title,
    errorLog: log.error(exception.stack),
  }

  const body: string | undefined =
    req.mode === 'edit' || req.mode === 'preview' || req.mode === 'inline' ? render(errorView, model) : undefined

  return {
    body,
    contentType: 'text/html',
    status: 400,
  }
}

export interface ErrorLib {
  renderError: (req: XP.Request, title: string, exception: Error) => XP.Response
}
