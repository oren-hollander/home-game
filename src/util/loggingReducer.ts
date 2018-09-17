import { HomeGameAction, State } from '../app/state'
import { Reducer } from 'redux'

export const loggingReducer = (log: (oldState: State | undefined, newState: State) => void) => (
  reducer: Reducer<State, HomeGameAction>
): Reducer<State, HomeGameAction> => (state, action) => {
  const newState = reducer(state, action)
  log(state, newState)
  return newState
}
