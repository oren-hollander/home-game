import { HomeGameAsyncThunkAction } from '../state'
import { getUser } from '../auth/authReducer'
import { User } from '../../db/types'

export const ADD_FRIEND = 'friends/add'
export const REMOVE_FRIEND = 'friends/remove'
export const LOAD_FRIENDS = 'friends/load'
export const SET_FRIENDS = 'friends/set'
export const CONNECT_FRIENDS = 'friends/connect'

export const setFriends = (friends: ReadonlyArray<User>) => ({ type: SET_FRIENDS as typeof SET_FRIENDS, friends })
export type SetFriends = ReturnType<typeof setFriends>

export type FriendsAction = SetFriends

export const createFriendInvitation = (): HomeGameAsyncThunkAction<string> => async (dispatch, getState, { db }) => {
  const userId = getUser(getState()).userId
  return await db.createFriendInvitation(userId)
}

export const acceptFriendInvitation = (
  friendId: string,
  invitationId: string
): HomeGameAsyncThunkAction<void> => async (dispatch, getState, { db }) => {
  const userId = getUser(getState()).userId
  return await db.acceptFriendInvitation(userId, invitationId, friendId)
}

export const addFriend = (friendId: string): HomeGameAsyncThunkAction => async (dispatch, getState, { db }) => {
  const userId = getUser(getState()).userId
  await db.addFriend(userId, friendId)
  // await dispatch(loadFriends())
}

export const removeFriend = (friendId: string): HomeGameAsyncThunkAction => async (dispatch, getState, { db }) => {
  const userId = getUser(getState()).userId
  await db.removeFriend(userId, friendId)
}

export const connectFriends = (friendId: string): HomeGameAsyncThunkAction => async (dispatch, getState, { db }) => {
  const userId = getUser(getState()).userId
  await db.addFriend(userId, friendId)
  await db.addFriend(friendId, userId)
}
