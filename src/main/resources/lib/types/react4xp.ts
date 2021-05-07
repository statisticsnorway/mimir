import { Request } from 'enonic-types/controller'
import { Component } from 'enonic-types/portal'

export interface React4xp {
    new (entry: string): React4xpObject;
    render: (
        entry: string | Component<any>,
        props?: object,
        request?: Request,
        options?: object
        ) => React4xpResponse;
}

export interface React4xpObject {
    react4xpId: string;
    renderBody: (options?: React4xpRenderBodyOptions) => React4xpResponse['body'];
    renderPageContributions: (options?: React4xpPageContributionOptions) => React4xpResponse['pageContributions'];
    setId: (id: string) => React4xpObject;
    setJsxPath: (path: string) => React4xpObject;
    setProps: (props: object) => React4xpObject;
    uniqueId: () => React4xpObject;
}

export interface React4xpResponse {
    body: string;
    pageContributions: string;
}

interface React4xpRenderBodyOptions {
    body: string;
    clientRender?: boolean;
}

interface React4xpPageContributionOptions {
    pageContributions: React4xpPageContributionOptions;
    clientRender: boolean;
}

