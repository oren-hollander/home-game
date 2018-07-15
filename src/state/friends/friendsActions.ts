import {Dispatch} from "redux"
import * as firebase from 'firebase/app'
import {map} from 'lodash/fp'
import {Effects} from '../../effect/effect'
import {GetState} from '../index'
import {getUserId} from '../auth/authReducer'

interface Services {
  db: firebase.firestore.Firestore
}

export const ADD_FRIEND = 'friends/add'
export const REMOVE_FRIEND = 'friends/remove'
export const LOAD_FRIENDS = 'friends/load'
export const SET_FRIENDS = 'friends/set'

export const addFriend = (friendId: string) => ({type: ADD_FRIEND as typeof ADD_FRIEND, friendId})
export type AddFriend = ReturnType<typeof addFriend>

export const removeFriend = (userId: string, friendId: string) => ({type: REMOVE_FRIEND as typeof REMOVE_FRIEND, userId, friendId})
export type RemoveFriend = ReturnType<typeof removeFriend>

export const loadFriends = (userId: string) => ({type: LOAD_FRIENDS as typeof LOAD_FRIENDS, payload: {userId}})
export type LoadFriends = ReturnType<typeof loadFriends>

export const setFriends = (friendIds: string[]) => ({type: SET_FRIENDS as typeof SET_FRIENDS, payload: {friendIds}})
export type SetFriends = ReturnType<typeof setFriends>

export type FriendsAction = AddFriend | RemoveFriend | LoadFriends | SetFriends

export const addFriendEffect = async (addFriend: AddFriend, dispatch: Dispatch, getState: GetState, {db} : Services) => {
  const userId = getUserId(getState())!
  await db.collection('users').doc(userId).collection('friends').doc(addFriend.friendId).set({})
}

export const removeFriendEffect = async (removeFriend: RemoveFriend, dispatch: Dispatch, getState: GetState, {db} : Services) =>
  await db.collection('users').doc(removeFriend.userId).collection('friends').doc(removeFriend.friendId).delete()

export const loadFriendsEffect = async (loadFriends: LoadFriends, dispatch: Dispatch, getState: GetState, {db} : Services) => {
  const friends = await db.collection('users').doc(loadFriends.payload.userId).collection('friends').get()
  const friendIds: string[] = map(friend => friend.id, friends.docs)
  dispatch(setFriends(friendIds))
}

export const friendsEffects: Effects = {
  [ADD_FRIEND]: addFriendEffect,
  [REMOVE_FRIEND]: removeFriendEffect,
  [LOAD_FRIENDS]: loadFriendsEffect,
}