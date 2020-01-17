/*
 * Still missing a lot, fill out as needed
 * https://github.com/enonic/lib-util/tree/master/src/main/resources/lib/util
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
}
