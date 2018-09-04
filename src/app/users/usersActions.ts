import {User} from '../../db/types'
import { HomeGameThunkAction } from '../state'

export const CREATE_USER = 'users/create'
export const UPDATE_ADDRESS = 'users/address/update'
export const LOAD_USER = 'users/load'
export const SET_USER = 'users/set'

const createUser = (user: User) => ({ type: CREATE_USER as typeof CREATE_USER, user })
export type CreateUser = ReturnType<typeof createUser>

export const createUserEffect = (user: User): HomeGameThunkAction =>  async (dispatchg, getState, { gamesDb }) => {
  await gamesDb.createUser(user)
}

export type UsersAction = CreateUser
