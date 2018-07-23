import {map} from 'lodash/fp'
import {isArray, flatMap, isUndefined} from 'lodash/fp'
import {Action, AnyAction, Dispatch, MiddlewareAPI} from 'redux'

interface Services {
  [key: string]: any
}

export type Effect<T extends Action<string> = AnyAction> = (action: T, store: MiddlewareAPI, services: Services) => void
export type EffectHandler = (type: string) => Effect[]

export interface EffectMap {
  [key: string]: Effect | Effect[] | undefined
}

const all = Promise.all.bind(Promise)
const invokeEffect = (action: Action<string>, store: MiddlewareAPI, services: Services) => (effect: Effect) => effect(action, store, services)

export const createEffectsMiddleware = (effectHandler: EffectHandler, services: Services) => (store: MiddlewareAPI) => (next: Dispatch) => (action: Action<string>) =>
  new Promise(resolve => {
    next(action)
    resolve(action.type)
  })
    .then(effectHandler)
    .then(map(invokeEffect(action, store, services)))
    .then(all)



const toArray: (value: Effect | Effect[] | undefined) => Effect[] = value => {
  if (isArray(value)) {
    return value
  } else if (isUndefined(value)) {
    return []
  }

  return [value]
}

export const createEffectHandler: (effectMap: EffectMap) => EffectHandler = effectMap => (actionType => toArray(effectMap[actionType]))

export const combineEffectHandlers = (...effectHandler: EffectHandler[]) => (actionType: string) => flatMap(effect => effect(actionType), effectHandler)