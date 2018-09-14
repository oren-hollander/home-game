import { assign, omit } from 'lodash/fp'

type Callback = (...args: any[]) => any
export interface CallbackStore {
  add: (name: string, callback: Callback) => void
  get: (name: string) => Callback
  remove: (name: string) => void
  callAndRemove: (name: string, ...args: any[]) => any
}

export const CallbackStore: () => CallbackStore = () => {
  interface Callbacks {
    [key: string]: Callback
  }

  let callbacks: Callbacks = {}

  const add = (name: string, callback: Callback) => {
    callbacks = assign({ [name]: callback }, callbacks)
  }

  const get = (name: string) => callbacks[name]

  const remove = (name: string) => {
    callbacks = omit([name], callbacks)
  }

  const callAndRemove = (name: string, ...args: any[]) => callbacks[name](...args)

  return {
    add,
    get,
    remove,
    callAndRemove
  }
}
