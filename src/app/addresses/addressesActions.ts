import { Address } from '../../db/types'
import { HomeGameThunkAction } from '../state'
import { getUser } from '../auth/authReducer'
import { map } from 'lodash/fp'

export const SET_ADDRESSES = 'addresses/set'
export const ADD_ADDRESS = 'addresses/add'
export const REMOVE_ADDRESS = 'addresses/remove'
export const UPDATE_ADDRESS = 'addresses/update'
export const LOAD_ADDRESSES = 'addresses/load'

export const setAddresses = (addresses: Address[]) => ({ type: SET_ADDRESSES as typeof SET_ADDRESSES, addresses })
export type SetAddresses = ReturnType<typeof setAddresses>

export const addAddress = (address: Address) => ({ type: ADD_ADDRESS as typeof ADD_ADDRESS, address })
export type AddAddress = ReturnType<typeof addAddress>

export const removeAddress = (addressId: string) => ({ type: REMOVE_ADDRESS as typeof REMOVE_ADDRESS, addressId })
export type RemoveAddress = ReturnType<typeof removeAddress>

export const updateAddress = (address: Address) => ({ type: UPDATE_ADDRESS as typeof UPDATE_ADDRESS, address })
export type UpdateAddress = ReturnType<typeof updateAddress>

export const loadAddresses = () => ({ type: LOAD_ADDRESSES as typeof LOAD_ADDRESSES })
export type LoadAddresses = ReturnType<typeof loadAddresses>

export type AddressesAction = SetAddresses | AddAddress | RemoveAddress | UpdateAddress | LoadAddresses

export const addAddressEffect = (address: Address): HomeGameThunkAction => async (dispatch, getState, { db }) => {
  const userId = getUser(getState()).userId
  await db.collection('users').doc(userId).collection('addresses').add(address)
  dispatch(loadAddresses())
}

export const updateAddressEffect = (address: Address): HomeGameThunkAction => async (dispatch, getState, { db }) => {
  const userId = getUser(getState()).userId
  await db.collection('users').doc(userId).collection('addresses').doc(address.label).set(address)
  dispatch(loadAddresses())
}

export const removeAddressEffect = (addressId: string): HomeGameThunkAction => async (dispatch, getState, { db }) => {
  const userId = getUser(getState()).userId
  await db.collection('users').doc(userId).collection('addresses').doc(addressId).delete()
  dispatch(loadAddresses())
}

export const loadAddressesEffect = (): HomeGameThunkAction => async (dispatch, getState, { db }) => {
  const userId = getUser(getState()).userId
  const addressRefs = await db.collection('users').doc(userId).collection('addresses').get()
  const addresses = map(doc => doc.data() as Address, addressRefs.docs)
  dispatch(setAddresses(addresses))
}