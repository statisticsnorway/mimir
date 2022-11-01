export function notNullOrUndefined<T>(val: T | null | undefined): val is T {
  return val !== null && val !== undefined
}

export function notEmptyOrUndefined(str?: string | null | undefined): str is string {
  return str !== undefined && str !== null && str.length > 0;
}
