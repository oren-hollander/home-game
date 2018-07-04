import { combineReducers} from 'redux'
import { reducer as authReducer } from './auth/authReducer'
import {createSelector} from 'reselect'
import {mapValues} from 'lodash/fp'
import {AuthAction} from './auth/authActions'
import {AuthState, isEmailVerified, isUserSignedIn} from './auth/authReducer'

const selectAuth = (state: State): AuthState => state.auth

export interface State {
  auth: AuthState
}

export type Action = AuthAction

export const reducer: (state: State, action: Action) => State = combineReducers({
  auth: authReducer
})

export const authSelectors = mapValues(selector => createSelector(selectAuth, selector), [isEmailVerified, isUserSignedIn])
