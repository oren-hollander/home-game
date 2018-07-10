import {Action, AnyAction, Dispatch, Store,} from "redux";
import {Services} from '../app/services'
import {reduce, assign} from 'lodash/fp'

export type Effect = (action: AnyAction, dispatch: Dispatch, getState: () => any, services: object) => void

export type Effects = {
  [key: string]: (Effect | undefined)
}

export const effectMiddleware = (effects: Effects, services: Services) => (store: Store) => (next: Dispatch) => (action: Action) : void => {
  next(action)
  let effect = effects[action.type]
  if(effect)
    effect(action, store.dispatch, store.getState, services)
}

export const mergeEffects = (...effects: Effects[]): Effects => reduce((effects, effect) => assign(effects, effect), {}, effects)