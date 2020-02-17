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

const errorView: ResourceKey = resolve('./error.html')

export function renderError(req: Request, title: string, exception: string): Response {
  const model: Error = {
    errorBody: exception,
    errorTitle: title,
    errorLog: log.error(exception)
  }

  if (req.mode === 'edit' || req.mode === 'preview' || req.mode === 'inline') {
    return {
      body: render(errorView, model),
      contentType: 'text/html',
      status: 400
    }
  } else {
    return {
      contentType: 'text/html',
      status: 400
    }
  }
}
