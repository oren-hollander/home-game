import { combineReducers, Reducer } from 'redux'
import { reducer as authReducer } from './auth/authReducer'
import { AuthAction } from './auth/authActions'
import { AuthState } from './auth/authReducer'
import { friendsReducer, FriendsState } from './friends/friendsReducer'
import { gamesReducer, GamesState } from './games/gamesReducer'
import { GamesAction } from './games/gamesActions'
import { FriendsAction } from './friends/friendsActions'
import { StatusAction } from './status/statusActions'
import { AddressesState } from './addresses/addressesReducer'
import { addressesReducer } from './addresses/addressesReducer'
import { statusReducer, StatusState } from './status/statusReducer'
import { ThunkAction, ThunkDispatch } from 'redux-thunk'
import { Services } from '../services/services'
import { AddressesAction } from './addresses/addressesActions'
import { UsersAction } from './users/usersActions'
import { RouterAction } from 'connected-react-router'
import { USER_SIGNED_OUT } from './auth/authActions'
import { DataStatusAction } from './dataStatus/dataStatusActions'
import { usersReducer, UsersState } from './users/usersReducer'

export type HomeGameAsyncThunkAction<T = void> = ThunkAction<Promise<T>, State, Services, HomeGameAction>
export type HomeGameThunkAction<T = void> = ThunkAction<T, State, Services, HomeGameAction>
export type HomeGameThunkDispatch = ThunkDispatch<State, Services, HomeGameAction>

export interface State {
  auth: AuthState
  friends: FriendsState
  games: GamesState
  addresses: AddressesState
  status: StatusState
  users: UsersState
}

export type HomeGameAction =
  | AuthAction
  | GamesAction
  | FriendsAction
  | StatusAction
  | AddressesAction
  | UsersAction
  | RouterAction
  | DataStatusAction

const signOutReducer = (reducer: Reducer<State, HomeGameAction>): Reducer<State, HomeGameAction> => (state, action) => {
  switch (action.type) {
    case USER_SIGNED_OUT:
      return reducer(undefined, action)
    default:
      return reducer(state, action)
  }
}

export const reducer: Reducer<State, HomeGameAction> = signOutReducer(
  combineReducers({
    auth: authReducer,
    friends: friendsReducer,
    games: gamesReducer,
    addresses: addressesReducer,
    status: statusReducer,
    users: usersReducer
  })
)
