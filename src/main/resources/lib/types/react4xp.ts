export interface React4xp {
  new (entry: string): React4xpObject
  render: (entry: string, props?: object, request?: XP.Request | XP.MacroContext, options?: object) => React4xpResponse
}

export interface React4xpObject {
  react4xpId: string
  renderBody: (options?: React4xpRenderBodyOptions) => React4xpResponse['body']
  renderPageContributions: (
    options?: React4xpPageContributionOptions | React4xpOptionalPageContributionOptions
  ) => React4xpResponse['pageContributions']
  setId: (id: string) => React4xpObject
  setJsxPath: (path: string) => React4xpObject
  setProps: (props: object) => React4xpObject
  uniqueId: () => React4xpObject
}

export interface React4xpResponse {
  body: string
  pageContributions: string
}

interface React4xpRenderBodyOptions {
  body: string
  clientRender?: boolean
}

interface React4xpOptionalPageContributionOptions {
  pageContributions?: {
    headBegin?: string | Array<string>
    headEnd?: string | Array<string>
    bodyBegin?: string | Array<string>
    bodyEnd?: string | Array<string>
  }
  clientRender?: boolean
}

export interface React4xpPageContributionOptions {
  pageContributions?: React4xpPageContributionOptions
  clientRender?: boolean
}
