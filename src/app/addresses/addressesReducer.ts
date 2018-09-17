import { Reducer } from 'redux'
import { Address } from '../../db/types'
import { SET_ADDRESSES, SET_ADDRESS, MARK_STALE, MARK_FRESH, AddressesAction } from './addressesActions'
import { Selector, ParametricSelector } from 'reselect'
import { State } from '../state'
import { flow, isEmpty, find, reject, concat } from 'lodash/fp'
import { DataStatus } from '../../data/dataStatus'

export type AddressesState = {
  addresses: ReadonlyArray<Address>
  status: DataStatus
}

const initialState: AddressesState = {
  addresses: [],
  status: 'stale'
}

const byAddressId = (addressId: string) => (address: Address): boolean => address.addressId === addressId

export const addressesReducer: Reducer<AddressesState, AddressesAction> = (addresses = initialState, action) => {
  switch (action.type) {
    case SET_ADDRESSES:
      return { ...addresses, addresses: action.addresses }
    case SET_ADDRESS:
      return {
        ...addresses,
        addresses: flow(
          reject(byAddressId(action.address.addressId)),
          concat([action.address])
        )(addresses.addresses)
      }
    case MARK_STALE:
      return { ...addresses, status: 'stale' }
    case MARK_FRESH:
      return { ...addresses, status: 'fresh' }
    default:
      return addresses
  }
}

export const getAddresses: Selector<State, ReadonlyArray<Address>> = state => state.addresses.addresses
export const getDataStatus: Selector<State, DataStatus> = state => state.addresses.status

export const getAddress: ParametricSelector<State, string, Address | undefined> = (state, addressId) =>
  find(address => address.addressId === addressId, state.addresses.addresses)

export const hasAddresses: Selector<State, boolean> = state => !isEmpty(state.addresses)
