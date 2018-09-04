import { Reducer } from 'redux'
import { User } from '../../db/types'
import { UsersAction } from './usersActions'

export const usersReducer: Reducer<User | null, UsersAction> = (user = null, action) => user