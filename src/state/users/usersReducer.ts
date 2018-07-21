import {Reducer} from 'redux'
import {Address} from '../../model/types'
import {UsersAction, SET_ADDRESS} from './usersActions'
import {Selector} from 'reselect'
import {State} from '../index'

export const usersReducer: Reducer<Address | null, UsersAction> = (address = null, action) => {
  switch(action.type) {
    case SET_ADDRESS:
      return action.address
    default:
      return address
  }
}

export const getAddress: Selector<State, Address | null> = state => state.address