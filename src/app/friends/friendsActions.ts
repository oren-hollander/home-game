import { map } from 'lodash/fp'
import { HomeGameThunkAction } from '../state'
import { getUser } from '../auth/authReducer'

export const ADD_FRIEND = 'friends/add'
export const REMOVE_FRIEND = 'friends/remove'
export const LOAD_FRIENDS = 'friends/load'
export const SET_FRIENDS = 'friends/set'
export const CONNECT_FRIENDS = 'friends/connect'

export const addFriend = (friendId: string) => ({type: ADD_FRIEND as typeof ADD_FRIEND, friendId})
export type AddFriend = ReturnType<typeof addFriend>

export const removeFriend = (userId: string, friendId: string) => ({type: REMOVE_FRIEND as typeof REMOVE_FRIEND, userId, friendId})
export type RemoveFriend = ReturnType<typeof removeFriend>

export const loadFriends = (userId: string) => ({type: LOAD_FRIENDS as typeof LOAD_FRIENDS, payload: {userId}})
export type LoadFriends = ReturnType<typeof loadFriends>

export const setFriends = (friendIds: string[]) => ({ type: SET_FRIENDS as typeof SET_FRIENDS, payload: { friendIds } })
export type SetFriends = ReturnType<typeof setFriends>

export const connectFriends = (friendId: string) => ({ type: CONNECT_FRIENDS as typeof CONNECT_FRIENDS, friendId })
export type ConnectFriends = ReturnType<typeof connectFriends>

export type FriendsAction = AddFriend | RemoveFriend | LoadFriends | SetFriends | ConnectFriends

export const addFriendEffect = (friendId: string): HomeGameThunkAction => async (dispatch, getState, { db }) => {
  const userId = getUser(getState()).name
  await db.collection('users').doc(userId).collection('friends').doc(friendId).set({})
}

export const removeFriendEffect = (userId: string, friendId: string): HomeGameThunkAction => async (dispatch, getState, { db }) =>
  await db.collection('users').doc(userId).collection('friends').doc(friendId).delete()

export const loadFriendsEffect = (): HomeGameThunkAction => async (dispatch, getState, { db }) => {
  const userId = getUser(getState()).name
  const friends = await db.collection('users').doc(userId).collection('friends').get()
  const friendIds: string[] = map(friend => friend.id, friends.docs)
  dispatch(setFriends(friendIds))
}

export const connectFriendsEffect = (friendId: string): HomeGameThunkAction => async (dispatch, getState, { db }) => {
  const userId = getUser(getState()).name
  await db.collection('users').doc(userId).collection('friends').doc(friendId).set({})
  await db.collection('users').doc(friendId).collection('friends').doc(userId).set({})
}