import { FriendsAction, SET_FRIENDS } from './friendsActions'
import { State } from '../state'
import { User } from '../../db/types';
import { map, compact } from 'lodash/fp'
import { getUser } from '../users/usersReducer';

export type FriendsState = ReadonlyArray<string>

export const friendsReducer = (friendIds: FriendsState = [], action: FriendsAction): FriendsState => {
  switch (action.type) {
    case SET_FRIENDS:
      return action.friendIds
    default:
      return friendIds
  }
}

export const getFriends = (state: State): ReadonlyArray<User> => compact(map(friendId => getUser(state, friendId), state.friends))
