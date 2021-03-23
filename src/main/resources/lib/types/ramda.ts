export type Morphism<T, U> = (value: T) => U;
export type Property = string | number | symbol;
export type List<T> = T[] | ArrayLike<T>;
export interface Dictionary<T> {
    [key: string]: T;
}

export interface Ramda {
    groupBy: <T>(fn: Morphism<T, Property>, list: List<T>) => Dictionary<T[]>;
}

