import {Address, User} from '../../model/types'
import {Services} from '../../app/services'
import {State} from '../index'
import {Dispatch, MiddlewareAPI} from 'redux'
import {getUserId} from '../auth/authReducer'
import {createEffectHandler} from '../../effect/effect'
import {assign} from 'lodash/fp'

export const REGISTER_USER = 'users/register'
export const SET_ADDRESS = 'users/address/set'
export const LOAD_ADDRESS = 'users/address/load'

export const registerUser = (email: string, name: string, password: string) =>
  ({type: REGISTER_USER as typeof REGISTER_USER, email, name, password})
export type RegisterUser = ReturnType<typeof registerUser>

export const setAddress = (address: Address) => ({type: SET_ADDRESS as typeof SET_ADDRESS, address})
export type SetAddress = ReturnType<typeof setAddress>

export const loadAddress = () => ({type: LOAD_ADDRESS as typeof LOAD_ADDRESS})
export type LoadAddress = ReturnType<typeof loadAddress>

export const loadAddressEffect = async (loadAddress: LoadAddress, store: MiddlewareAPI<Dispatch, State>, {db}: Services) => {
  const userId = getUserId(store.getState())!
  const userDoc = await db.collection('users').doc(userId).get()

  const user = userDoc.data()! as User
  if(user.address)
    store.dispatch(setAddress(user.address))
}

export const registerUserEffect = async (registerUser: RegisterUser, store: MiddlewareAPI<Dispatch, State>, {db, auth}: Services) => {
  await auth.createUserWithEmailAndPassword(registerUser.email, registerUser.password)
  await auth.signInWithEmailAndPassword(registerUser.email, registerUser.password)
  const userId = getUserId(store.getState())!
  const user: User = {
    userId,
    name: registerUser.name,
    email: registerUser.email
  }
  db.collection('users').doc(userId).set(user)
}

export const setAddressEffect = async (setAddress: SetAddress, store: MiddlewareAPI<Dispatch, State>, {db}: Services) => {
  const userId = getUserId(store.getState())!
  await db.runTransaction(async tx => {
    const docRef = db.collection('users').doc(userId)
    const userDoc = await tx.get(docRef)
    const user = userDoc.data()! as User
    const updatedUser = assign(user, {address: setAddress.address})
    tx.set(docRef, updatedUser)
  })
}

export type UsersAction = SetAddress | LoadAddress

export const usersEffects = createEffectHandler({
  [SET_ADDRESS]: setAddressEffect,
  [LOAD_ADDRESS]: loadAddressEffect,
  [REGISTER_USER]: registerUserEffect
})