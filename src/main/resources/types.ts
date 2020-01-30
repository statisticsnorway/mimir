declare function __non_webpack_require__<T>(path: string): T

declare function require<T>(path: string): T

declare const resolve: (path: string) => any

declare const app: {
    name: string;
    version: string;
}

declare const log: {
    info: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
}

declare const __: {
    newBean: (bean: string) => any;
    toNativeObject: (beanResult: any) => any;
}
