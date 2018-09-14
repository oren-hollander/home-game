import { Selector } from 'reselect'
import { State } from '../state'
import { Reducer } from 'redux'
import { StatusAction, ENQUEUE_STATUS, DEQUEUE_STATUS } from './statusActions'
import { isEmpty, concat, head, tail } from 'lodash/fp'

export type StatusType = 'success' | 'error' | 'warning' | 'info'

export interface StatusMessage {
  type: StatusType
  text: string
}

export type StatusState = ReadonlyArray<StatusMessage>

const initialStatusState: StatusState = []

export const statusReducer: Reducer<StatusState, StatusAction> = (status = initialStatusState, action): StatusState => {
  switch (action.type) {
    case ENQUEUE_STATUS:
      return concat(status, [action.status])
    case DEQUEUE_STATUS:
      return tail(status)
    default:
      return status
  }
}

export const hasStatus: Selector<State, boolean> = state => !isEmpty(state.status)
export const getStatus: Selector<State, StatusMessage | undefined> = state => head(state.status)
