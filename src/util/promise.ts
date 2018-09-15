import { head, tail, noop } from 'lodash/fp'

type Settling<T> = {
  resolve(value?: T | PromiseLike<T>): void
  reject(reason?: any): void
}

export type SettlingPromise<T> = Settling<T> & Promise<T>

export const SettlingPromise = <T = any>(): SettlingPromise<T> => {
  let resolvePromise: (value?: T | PromiseLike<T>) => void = noop
  let rejectPromise: (reason?: any) => void = noop

  const settlingPromise = new Promise<T>((resolve, reject) => {
    resolvePromise = resolve
    rejectPromise = reject
  }) as SettlingPromise<T>

  settlingPromise.resolve = resolvePromise
  settlingPromise.reject = rejectPromise

  return settlingPromise
}

export type PromiseChain<T> = {
  resolveNext(value?: T | PromiseLike<T>): void
  rejectNext(reason?: any): void
}

export const promiseChain = <T>(...promises: Settling<T>[]): PromiseChain<T> => {
  let nextPromises = promises
  return {
    resolveNext(value?: T | PromiseLike<T>) {
      const nextPromise = head(nextPromises)
      nextPromise && nextPromise.resolve(value)
      nextPromises = tail(nextPromises)
    },
    rejectNext(reason?: any) {
      const nextPromise = head(nextPromises)
      nextPromise && nextPromise.reject(reason)
      nextPromises = tail(nextPromises)
    }
  }
}
