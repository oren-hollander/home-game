import {Reducer} from 'redux'
import {Address, User} from '../../model/types'
import {UsersAction, SET_USER} from './usersActions'
import {Selector} from 'reselect'
import {State} from '../index'
import {has} from 'lodash/fp'

export const usersReducer: Reducer<User | null, UsersAction> = (user = null, action) => {
  switch(action.type) {
    case SET_USER:
      return action.user
    default:
      return user
  }
}

export const getAddress: Selector<State, Address | null> = state => state.user ? (state.user.address ? state.user.address : null) : null
export const hasAddress: Selector<State, boolean> = state => has('user.address', state)
