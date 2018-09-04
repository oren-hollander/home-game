import { Selector } from 'reselect'
import { State } from '../state'
import { Reducer } from 'redux'
import { StatusAction, ENQUEUE_ERROR, DEQUEUE_ERROR, ENQUEUE_STATUS, DEQUEUE_STATUS } from './statusActions'
import { isEmpty, set, update, head, tail, defaultTo } from 'lodash/fp'

export type StatusState = {
  readonly errors: ReadonlyArray<string>
  readonly statuses: ReadonlyArray<string>
}

const initialStatusState: StatusState = {
  errors: [],
  statuses: []
}

const push = <T>(t: T) => <A extends ReadonlyArray<T>>(a: A): A => {
  return set(a.length, t, a)
}

export const statusReducer: Reducer<StatusState, StatusAction> = (status = initialStatusState, action): StatusState => {
  switch (action.type) {
    case ENQUEUE_ERROR: 
      return update('errors', push(action.message), status)
    case DEQUEUE_ERROR:
      return update('errors', tail, status)
    case ENQUEUE_STATUS:
      return update('statuses', push(action.status), status)
    case DEQUEUE_STATUS: 
      return update('statuses', tail, status)
    default: 
      return status
  }
}

export const hasErrors: Selector<State, boolean> = state => !isEmpty(state.status.errors)
export const getError: Selector<State, string> = state => defaultTo('', head(state.status.errors))
export const hasStatus: Selector<State, boolean> = state => !isEmpty(state.status.statuses)
export const getStatus: Selector<State, string> = state => defaultTo('', head(state.status.statuses))