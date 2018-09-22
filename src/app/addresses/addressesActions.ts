import { Address } from '../../db/types'
import { HomeGameAsyncThunkAction } from '../state'
import { getSignedInUser } from '../auth/authReducer'
import { push } from 'connected-react-router'
import { SuccessStatus, showStatus } from '../status/statusActions'

export const SET_ADDRESSES = 'addresses/set-addresses'
export const SET_ADDRESS = 'addresses/set-address'

export const setAddresses = (addresses: ReadonlyArray<Address>) => ({
  type: SET_ADDRESSES as typeof SET_ADDRESSES,
  addresses
})
export type SetAddresses = ReturnType<typeof setAddresses>

export const setAddress = (address: Address) => ({
  type: SET_ADDRESS as typeof SET_ADDRESS,
  address
})
export type SetAddress = ReturnType<typeof setAddress>

export type AddressesAction = SetAddresses | SetAddress 

export const addAddress = (address: Address): HomeGameAsyncThunkAction => async (dispatch, getState, { db }) => {
  const userId = getSignedInUser(getState()).userId
  await db.createAddress(userId, address)
  await dispatch(push('/addresses'))
}

export const updateAddress = (address: Address): HomeGameAsyncThunkAction => async (dispatch, getState, { db }) => {
  const userId = getSignedInUser(getState()).userId
  await db.updateAddress(userId, address)
  dispatch(showStatus(SuccessStatus('Address updated')))
}

export const removeAddress = (addressId: string): HomeGameAsyncThunkAction => async (dispatch, getState, { db }) => {
  const userId = getSignedInUser(getState()).userId
  await db.removeAddress(userId, addressId)
}