import { ResourceKey } from 'enonic-types/lib/thymeleaf'
import { Response } from 'enonic-types/lib/controller'
const {
  render
} = __non_webpack_require__( '/lib/thymeleaf')

export interface Error {
    errorTitle: string;
    errorBody: string;
}

const errorView: ResourceKey = resolve('./error.html')

export function renderError(title: string, exception: string): Response {
  const model: Error = {
    errorBody: exception,
    errorTitle: title
  }
  return {
    body: render(errorView, model),
    contentType: 'text/html',
    status: 400
  }
}
