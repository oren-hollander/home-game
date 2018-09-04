import {FriendsAction, ADD_FRIEND, REMOVE_FRIEND, SET_FRIENDS, LOAD_FRIENDS} from './friendsActions'
import {concat, without} from 'lodash/fp'

export type FriendsState = ReadonlyArray<string>

export const friendsReducer = (friends: FriendsState = [], action: FriendsAction): FriendsState => {
  switch (action.type) {
    case ADD_FRIEND:
      return concat([action.friendId], friends)
    case REMOVE_FRIEND:
      return without([action.friendId], friends)
    case SET_FRIENDS:
      return action.payload.friendIds
    case LOAD_FRIENDS:
      return friends
    default:
      return friends
  }
}