import { combineReducers, Reducer } from 'redux'
import { reducer as authReducer } from './auth/authReducer'
import { AuthAction } from './auth/authActions'
import { AuthState } from './auth/authReducer'
import { friendsReducer, FriendsState } from './friends/friendsReducer'
import { gamesReducer, GamesState } from './games/gamesReducer'
import { GamesAction } from './games/gamesActions'
import { FriendsAction } from './friends/friendsActions'
import { User, Address } from '../model/types'
import { usersReducer } from './users/usersReducer'
import { addressesReducer } from './addresses/addressesReducer'

export interface State {
  auth: AuthState,
  friends: FriendsState,
  games: GamesState,
  user: User | null,
  addresses: Address[]
}

export type Action = AuthAction | GamesAction | FriendsAction

export const reducer: Reducer<State, Action> = combineReducers({
  auth: authReducer,
  friends: friendsReducer,
  games: gamesReducer,
  user: usersReducer,
  addresses: addressesReducer
})