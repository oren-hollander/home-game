export type Maybe<T> = T | null

type Identity<T> = (t: T) => T

export const isDefined = <T>(m: Maybe<T>): m is T => m !== null
export const isUndefined = <T>(m: Maybe<T>): m is null => m === undefined || m === null
export const getOrElse = <T>(m: Maybe<T>, defaultValue: T): T => (isDefined(m) ? m : defaultValue)
export const map = <T>(f: Identity<T>, m: Maybe<T>): Maybe<T> => (isDefined(m) ? f(m) : null)