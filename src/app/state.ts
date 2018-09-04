import { combineReducers, Reducer } from 'redux'
import { reducer as authReducer } from './auth/authReducer'
import { AuthAction } from './auth/authActions'
import { AuthState } from './auth/authReducer'
import { friendsReducer, FriendsState } from './friends/friendsReducer'
import { gamesReducer, GamesState } from './games/gamesReducer'
import { GamesAction } from './games/gamesActions'
import { FriendsAction } from './friends/friendsActions'
import { StatusAction } from './status/statusActions'
import { Address } from '../db/types'
import { addressesReducer } from './addresses/addressesReducer'
import { statusReducer, StatusState } from './status/statusReducer'
import { ThunkAction, ThunkDispatch } from 'redux-thunk'
import { Services } from '../services/services'
import { AddressesAction } from './addresses/addressesActions'
import { UsersAction } from './users/usersActions'
import { RouterAction } from 'connected-react-router';

export type HomeGameAsyncThunkAction<T = void> = ThunkAction<Promise<T>, State, Services, HomeGameAction>
export type HomeGameThunkAction<T = void> = ThunkAction<T, State, Services, HomeGameAction>
export type HomeGameThunkDispatch = ThunkDispatch<State, Services, HomeGameAction>

export interface State {
  auth: AuthState,
  friends: FriendsState,
  games: GamesState,
  addresses: ReadonlyArray<Address>,
  status: StatusState
}

export type HomeGameAction = AuthAction | GamesAction | FriendsAction | StatusAction | AddressesAction | UsersAction | RouterAction

export const reducer: Reducer<State, HomeGameAction> = combineReducers({
  auth: authReducer,
  friends: friendsReducer,
  games: gamesReducer,
  addresses: addressesReducer,
  status: statusReducer
})

