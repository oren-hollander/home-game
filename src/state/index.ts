import { combineReducers} from 'redux'
import { reducer as authReducer } from './auth/authReducer'
import {createSelector} from 'reselect'
import {mapValues} from 'lodash/fp'
import {AuthAction} from './auth/authActions'
import {AuthState, isEmailVerified, isUserSignedIn} from './auth/authReducer'
import {friendsReducer, FriendsState} from './friends/friendsReducer'
import {gamesReducer, GamesState} from './games/gamesReducer'
import {GamesAction} from './games/gamesActions'
import {FriendsAction} from './friends/friendsActions'

const selectAuth = (state: State): AuthState => state.auth

export interface State {
  auth: AuthState,
  friends: FriendsState,
  games: GamesState
}

export type GetState = () => State

export type Action = AuthAction | GamesAction | FriendsAction

export const reducer: (state: State, action: Action) => State = combineReducers({
  auth: authReducer,
  friends: friendsReducer,
  games: gamesReducer
})

export const authSelectors = mapValues(selector => createSelector(selectAuth, selector), [isEmailVerified, isUserSignedIn])
