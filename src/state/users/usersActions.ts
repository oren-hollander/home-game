import {User} from '../../model/types'
import {Services} from '../../app/services'
import {State} from '../index'
import {Dispatch, MiddlewareAPI} from 'redux'
import {getUserId} from '../auth/authReducer'
import {createEffectHandler} from '../../effect/effect'
import {Effect} from '../../effect/effect'

export const REGISTER_USER = 'users/register'
export const UPDATE_ADDRESS = 'users/address/update'
export const LOAD_USER = 'users/load'
export const SET_USER = 'users/set'

export const registerUser = (email: string, name: string, password: string) =>
  ({type: REGISTER_USER as typeof REGISTER_USER, email, name, password})
  
export type RegisterUser = ReturnType<typeof registerUser>

export const setUser = (user: User) => ({type: SET_USER as typeof SET_USER, user})
export type SetUser = ReturnType<typeof setUser>

export const loadUser = () => ({type: LOAD_USER as typeof LOAD_USER})
export type LoadUser = ReturnType<typeof loadUser>

export const loadUserEffect = async (loadUser: LoadUser, store: MiddlewareAPI<Dispatch, State>, {db}: Services) => {
  const userId = getUserId(store.getState())!
  const userSnapshot = await db.collection('users').doc(userId).get()
  const user: User = userSnapshot.data()! as User
  store.dispatch(setUser(user))
}

export const registerUserEffect: Effect<RegisterUser> = async (registerUser, store, {db, auth}) => {
  await auth.createUserWithEmailAndPassword(registerUser.email, registerUser.password)
  await auth.signInWithEmailAndPassword(registerUser.email, registerUser.password)
  const userId = getUserId(store.getState())!
  const user: User = {
    userId,
    name: registerUser.name
  }
  return db.collection('users').doc(userId).set(user)
}

export type UsersAction = RegisterUser | SetUser

export const usersEffects = createEffectHandler({
  [LOAD_USER]: loadUserEffect,
  [REGISTER_USER]: registerUserEffect
})