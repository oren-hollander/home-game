import {map} from 'lodash/fp'
import {isArray, flatMap, isUndefined} from 'lodash/fp'
import {Action, Dispatch, MiddlewareAPI} from 'redux'

interface Services {
  [key: string]: any
}

// export type Effect<T extends Action<string> = AnyAction> = (action: T, store: MiddlewareAPI, services: Services) => void
export interface Effect<T extends Action<string>> {
  (action: T, store: MiddlewareAPI, services: Services): void
}

export type EffectHandler = <T extends Action<string>, S extends Services>(type: string) => Effect<T>[]

export interface EffectMap<T extends Action<string>> {
  [key: string]: Effect<T> | Effect<T>[] | undefined
}

const invokeEffect = (action: Action<string>, store: MiddlewareAPI, services: Services) => (effect: Effect<Action<string>>) => effect(action, store, services)

export const createEffectsMiddleware = (effectHandler: EffectHandler, services: Services) => (store: MiddlewareAPI) => (next: Dispatch) => async (action: Action<string>) => {
  next(action)
  await Promise.resolve()
  const effects = effectHandler(action.type)
  return Promise.all(map(invokeEffect(action, store, services), effects))
}

const toArray: <T extends Action<string>>(value: Effect<T> | Effect<T>[] | undefined) => Effect<T>[] = value => {
  if (isArray(value)) {
    return value
  } else if (isUndefined(value)) {
    return []
  }

  return [value]
}

export const createEffectHandler: (effectMap: EffectMap<Action<string>>) => EffectHandler = effectMap => (actionType => toArray(effectMap[actionType]))

export const combineEffectHandlers = (...effectHandler: EffectHandler[]) => (actionType: string) => flatMap(effect => effect(actionType), effectHandler)