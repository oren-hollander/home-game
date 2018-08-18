import {Reducer} from 'redux'
import {User} from '../../model/types'
import {UsersAction, SET_USER} from './usersActions'

export const usersReducer: Reducer<User | null, UsersAction> = (user = null, action) => {
  switch(action.type) {
    case SET_USER:
      return action.user
    default:
      return user
  }
}
