/*
 * Still missing a lot, fill out as needed
 * https://github.com/enonic/lib-util/tree/master/src/main/resources/lib/util
 */
export interface UtilLibrary {
  readonly data: UtilDataLibrary;
}

interface UtilDataLibrary {
  forceArray(data: unknown): Array<unknown>;
}
