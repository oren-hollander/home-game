import { Reducer } from 'redux'
import { User } from '../../db/types'
import { UsersAction, SET_USERS, SET_USER } from './usersActions'
import { ParametricSelector } from 'reselect'
import { State } from '../state'
import { get, keyBy } from 'lodash/fp'
import { Dictionary } from 'lodash'

export type UsersState = Dictionary<User>

export const usersReducer: Reducer<UsersState, UsersAction> = (users = {}, action): UsersState => {
  switch (action.type) {
    case SET_USERS:
      return { ...users, ...keyBy(user => user.userId, action.users) }
    case SET_USER:
      return { ...users, [action.user.userId]: action.user }
    default:
      return users
  }
}

export const getUser: ParametricSelector<State, string, User | undefined> = (state, userId) => get(userId, state.users)
