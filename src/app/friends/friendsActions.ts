import {Dispatch, MiddlewareAPI} from "redux"
import * as firebase from 'firebase/app'
import {map} from 'lodash/fp'
import {createEffectHandler} from '../../effect/effect'
import {State} from '../state'
import {getUserId} from '../auth/authReducer'

interface Services {
  db: firebase.firestore.Firestore
}

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

export const addFriendEffect = async (addFriend: AddFriend, store: MiddlewareAPI<Dispatch, State>, {db} : Services) => {
  const userId = getUserId(store.getState())!
  await db.collection('users').doc(userId).collection('friends').doc(addFriend.friendId).set({})
}

export const removeFriendEffect = async (removeFriend: RemoveFriend, store: MiddlewareAPI<Dispatch, State>, {db} : Services) =>
  await db.collection('users').doc(removeFriend.userId).collection('friends').doc(removeFriend.friendId).delete()

export const loadFriendsEffect = async (loadFriends: LoadFriends, store: MiddlewareAPI<Dispatch, State>, {db} : Services) => {
  const friends = await db.collection('users').doc(loadFriends.payload.userId).collection('friends').get()
  const friendIds: string[] = map(friend => friend.id, friends.docs)
  store.dispatch(setFriends(friendIds))
}

export const connectFriendsEffect = async (connectFriends: ConnectFriends, store: MiddlewareAPI<Dispatch, State>, { db }: Services) => {
  const userId = getUserId(store.getState())!
  await db.collection('users').doc(userId).collection('friends').doc(connectFriends.friendId).set({})
  await db.collection('users').doc(connectFriends.friendId).collection('friends').doc(userId).set({})
}

export const friendsEffects = createEffectHandler({
  [ADD_FRIEND]: addFriendEffect,
  [REMOVE_FRIEND]: removeFriendEffect,
  [LOAD_FRIENDS]: loadFriendsEffect,
  [CONNECT_FRIENDS]: connectFriendsEffect
})