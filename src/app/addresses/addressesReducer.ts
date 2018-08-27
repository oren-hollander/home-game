import { Reducer } from 'redux'
import { Address } from '../../db/types'
import { SET_ADDRESSES, AddressesAction } from './addressesActions'
import { Selector } from 'reselect'
import { State } from '../state'

export const addressesReducer: Reducer<Address[], AddressesAction> = (addresses = [], action) => {
  switch(action.type) {
    case SET_ADDRESSES: 
      return action.addresses
    default: 
      return addresses
  }
}

export const getAddresses: Selector<State, ReadonlyArray<Address>> = state => state.addresses
export const getAddressCount: Selector<State, number> = state => state.addresses.length
