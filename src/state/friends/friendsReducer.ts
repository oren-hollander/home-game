import {FriendsAction, ADD_FRIEND, REMOVE_FRIEND, SET_FRIENDS, LOAD_FRIENDS} from './friendsActions'
import {concat, without} from 'lodash/fp'

export type FriendsState  = string[]

export const friendsReducer = (friends: FriendsState = [], action: FriendsAction): FriendsState => {
  switch (action.type) {
    case ADD_FRIEND:
      return concat([action.payload.friendId], friends)
    case REMOVE_FRIEND:
      return without([action.payload.friendId], friends)
    case SET_FRIENDS:
      return action.payload.friendIds
    case LOAD_FRIENDS:
      return friends
  }
}