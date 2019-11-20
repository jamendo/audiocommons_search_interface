/**
 * Exclude keys from a type.
 * @param T The type to exclude keys from.
 * @param K The keys to exclude.
 */
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
