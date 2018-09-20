import { FriendsAction, SET_FRIENDS } from './friendsActions'
import { User } from '../../db/types'
import { State } from '../state'
import { DataStatus } from '../../data/dataStatus'
import { combineReducers } from 'redux'
import { dataStatusReducer } from '../dataStatus/dataStatusReducer'

const friendListsReducer = (friends: ReadonlyArray<User> = [], action: FriendsAction): ReadonlyArray<User> => {
  switch (action.type) {
    case SET_FRIENDS:
      return action.friends
    default:
      return friends
  }
}

export type FriendsState = {
  friends: ReadonlyArray<User>
  dataStatus: DataStatus
}

export const friendsReducer = combineReducers({
  friends: friendListsReducer,
  dataStatus: dataStatusReducer('friends')
})

export const getFriends = (state: State): ReadonlyArray<User> => state.friends.friends
