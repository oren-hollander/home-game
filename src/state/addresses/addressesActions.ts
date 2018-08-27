import { createEffectHandler } from '../../effect/effect'
import { Address } from '../../db/types'
import { Dispatch, MiddlewareAPI } from 'redux'
import { State } from '../state'
import { Services } from '../app/services'
import { getUserId } from '../auth/authReducer'
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

export const addAddressEffect = async (addAddress: AddAddress, store: MiddlewareAPI<Dispatch, State>, { db }: Services) => {
  const userId = getUserId(store.getState())!
  await db.collection('users').doc(userId).collection('addresses').add(addAddress.address)
  store.dispatch(loadAddresses())
}

export const updateAddressEffect = async (updateAddress: UpdateAddress, store: MiddlewareAPI<Dispatch, State>, { db }: Services) => {
  const userId = getUserId(store.getState())!
  await db.collection('users').doc(userId).collection('addresses').doc(updateAddress.address.label).set(updateAddress.address)
  store.dispatch(loadAddresses())
}

export const removeAddressEffect = async (removeAddress: RemoveAddress, store: MiddlewareAPI<Dispatch, State>, { db }: Services) => {
  const userId = getUserId(store.getState())!
  await db.collection('users').doc(userId).collection('addresses').doc(removeAddress.addressId).delete()
  store.dispatch(loadAddresses())
}

export const loadAddressesEffect = async (loadAddresses: LoadAddresses, store: MiddlewareAPI<Dispatch, State>, { db }: Services) => {
  const userId = getUserId(store.getState())!
  const addressRefs = await db.collection('users').doc(userId).collection('addresses').get()
  const addresses = map(doc => doc.data() as Address, addressRefs.docs)
  store.dispatch(setAddresses(addresses))
}

export const addressesEffects = createEffectHandler({
  [ADD_ADDRESS]: addAddressEffect,
  [REMOVE_ADDRESS]: removeAddressEffect,
  [UPDATE_ADDRESS]: updateAddressEffect,
  [LOAD_ADDRESSES]: loadAddressesEffect
})
