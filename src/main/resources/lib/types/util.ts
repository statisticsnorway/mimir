/*
 * Still missing a lot, fill out as needed
 * https://github.com/enonic/lib-util/tree/master/src/main/resources/lib/util
 */
interface UtilDataLibrary {
  forceArray<T>(data: T | Array<T>): Array<T>
}

export declare const data: UtilDataLibrary

export type RowValue = number | string
