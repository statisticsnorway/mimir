/*
 * Still missing a lot, fill out as needed
 * https://github.com/enonic/lib-util/tree/master/src/main/resources/lib/util
 */
export interface UtilLibrary {
  readonly data: UtilDataLibrary
}
interface UtilDataLibrary {
  forceArray<T>(data: T | Array<T>): Array<T>
}

export declare const data: UtilDataLibrary
