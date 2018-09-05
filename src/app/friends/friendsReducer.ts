import { FriendsAction, SET_FRIENDS } from './friendsActions'

export type FriendsState = ReadonlyArray<string>

export const friendsReducer = (friends: FriendsState = [], action: FriendsAction): FriendsState => {
  switch (action.type) {
    case SET_FRIENDS:
      return action.payload.friendIds
    default:
      return friends
  }
}