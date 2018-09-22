import { User } from '../../db/types'
import { HomeGameAsyncThunkAction } from '../state'

export const SET_USERS = 'users/append'
export const SET_USER = 'users/set-user'

export const setUsers = (users: ReadonlyArray<User>) => ({ type: SET_USERS as typeof SET_USERS, users })
export type SetUsers = ReturnType<typeof setUsers>

export const setUser = (user: User) => ({ type: SET_USER as typeof SET_USER, user })
export type SetUser = ReturnType<typeof setUser>

export const createUser = (user: User): HomeGameAsyncThunkAction => async (_dispatch, _getState, { db }) => {
  await db.createUser(user)
}

export type UsersAction = SetUsers | SetUser
