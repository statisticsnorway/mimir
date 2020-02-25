import { ResourceKey } from 'enonic-types/lib/thymeleaf'
import { Response, Request } from 'enonic-types/lib/controller'
const {
  render
} = __non_webpack_require__( '/lib/thymeleaf')

export interface Error {
    errorTitle: string;
    errorBody: string;
    errorLog: void;
}

export interface Exception {
  message: string;
}

const errorView: ResourceKey = resolve('./error.html')

export function renderError(req: Request, title: string, exception: Exception): Response {
  const model: Error = {
    errorBody: exception.message,
    errorTitle: title,
    errorLog: log.error(exception)
  }

  const body: string = (req.mode === 'edit' || req.mode === 'preview' || req.mode === 'inline') ? render(errorView, model) : undefined

  return {
    body,
    contentType: 'text/html',
    status: 400
  }
}
