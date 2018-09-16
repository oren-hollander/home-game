export type Just<T> = {
  readonly type: 'just'
  readonly value: T
}

export const Just = <T>(value: T): Just<T> => ({ type: 'just', value })

export type Nothing = {
  readonly type: 'nothing'
}

export const Nothing: Nothing = { type: 'nothing' }

export type Maybe<T> = Just<T> | Nothing