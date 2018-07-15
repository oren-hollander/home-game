import { combineReducers} from 'redux'
import { reducer as authReducer } from './auth/authReducer'
import {AuthAction} from './auth/authActions'
import {AuthState} from './auth/authReducer'
import {friendsReducer, FriendsState} from './friends/friendsReducer'
import {gamesReducer, GamesState} from './games/gamesReducer'
import {GamesAction} from './games/gamesActions'
import {FriendsAction} from './friends/friendsActions'

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