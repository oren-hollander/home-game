import { Reducer, combineReducers } from 'redux'
import { Address } from '../../db/types'
import { SET_ADDRESSES, SET_ADDRESS, AddressesAction } from './addressesActions'
import { Selector, ParametricSelector } from 'reselect'
import { State } from '../state'
import { flow, isEmpty, find, reject, concat } from 'lodash/fp'
import { DataStatus } from '../../data/dataStatus'
import { dataStatusReducer } from '../dataStatus/dataStatusReducer';

export type AddressesState = {
  addresses: ReadonlyArray<Address>
  status: DataStatus
}

const byAddressId = (addressId: string) => (address: Address): boolean => address.addressId === addressId

export const addressListReducer: Reducer<ReadonlyArray<Address>, AddressesAction> = (addresses = [], action) => {
  switch (action.type) {
    case SET_ADDRESSES:
      return action.addresses
    case SET_ADDRESS:
      return flow(
        reject(byAddressId(action.address.addressId)),
        concat([action.address])
      )(addresses)      
    default:
      return addresses
  }
}

export const addressesReducer = combineReducers({
  addresses: addressListReducer,
  status: dataStatusReducer('addresses')
})

export const getAddresses: Selector<State, ReadonlyArray<Address>> = state => state.addresses.addresses

export const getAddress: ParametricSelector<State, string, Address | undefined> = (state, addressId) => 
  find(address => address.addressId === addressId, state.addresses.addresses)

export const hasAddresses: Selector<State, boolean> = state => !isEmpty(state.addresses)
