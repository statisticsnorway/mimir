/*
 * https://github.com/enonic/lib-cache/blob/master/src/main/resources/lib/cache.js
 */
export interface CacheLib {
  readonly newCache: (options: CacheOption) => Cache;
}

export interface CacheOption {
  size: number;
  expire: number;
}

export interface Cache {
  get<T>(key: string, fallback: () => T): T;
  clear: () => void;
  getSize: () => number;
  remove: (key: string) => void;
  removePattern: (keyRegex: string) => void;
}
