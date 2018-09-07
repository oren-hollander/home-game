import { FriendsAction, SET_FRIENDS } from './friendsActions'
import { User } from '../../db/types'
import { State } from '../state'

export type FriendsState = ReadonlyArray<User>

export const friendsReducer = (friends: FriendsState = [], action: FriendsAction): FriendsState => {
  switch (action.type) {
    case SET_FRIENDS:
      return action.friends
    default:
      return friends
  }
}

export const getFriends = (state: State): ReadonlyArray<User> => state.friends