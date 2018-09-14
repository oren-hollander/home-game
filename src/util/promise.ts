import { noop } from 'lodash/fp'

type Settling<T> = {
  resolve(value?: T | PromiseLike<T>): void
  reject(reason?: any): void
}

type SettlingPromise<T> = Settling<T> & Promise<T>

export const SettlingPromise = <T = any>(): SettlingPromise<T> => {
  let resolvePromise: (value?: T | PromiseLike<T>) => void = noop
  let rejectPromise: (reason?: any) => void = noop

  const promise = new Promise<T>((resolve, reject) => {
    resolvePromise = resolve
    rejectPromise = reject
  }) as SettlingPromise<T>

  promise.resolve = resolvePromise
  promise.reject = rejectPromise

  return promise
}

export const promiseChain = <T>(...promises: Settling<T>[]): Settling<T> => {
  let index = 0
  return {
    resolve(value?: T | PromiseLike<T>) {
      promises[index++].resolve(value)
    },
    reject(reason?: any) {
      promises[index++].reject(reason)
    }
  }
}
