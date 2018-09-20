import { Address } from '../../db/types'
import { HomeGameAsyncThunkAction } from '../state'
import { getUser } from '../auth/authReducer'
import { push } from 'connected-react-router'
import { SuccessStatus, showStatus } from '../status/statusActions'
import { delay } from '../../util/delay'
import { Unsubscribe } from '../../data/dataLoader';
import { noop } from 'lodash/fp'

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
  const userId = getUser(getState()).userId
  await db.createAddress(userId, address)
  await dispatch(loadAddresses())
  await dispatch(push('/addresses'))
}

export const updateAddress = (address: Address): HomeGameAsyncThunkAction => async (dispatch, getState, { db }) => {
  const userId = getUser(getState()).userId
  await db.updateAddress(userId, address)
  await dispatch(loadAddresses())
  dispatch(showStatus(SuccessStatus('Address updated')))
}

export const removeAddress = (addressId: string): HomeGameAsyncThunkAction => async (dispatch, getState, { db }) => {
  const userId = getUser(getState()).userId
  await db.removeAddress(userId, addressId)
  await dispatch(loadAddresses())
}

export const loadAddresses = (): HomeGameAsyncThunkAction<Unsubscribe> => async (dispatch, getState, { db }) => {
  const userId = getUser(getState()).userId
  const addresses = await db.getAddresses(userId)
  await delay(3000)

  dispatch(setAddresses(addresses))
  return noop
}

export const loadAddress = (addressId: string): HomeGameAsyncThunkAction<Unsubscribe> => async (dispatch, getState, { db }) => {
  const userId = getUser(getState()).userId
  const address = await db.getAddress(userId, addressId)
  dispatch(setAddress(address))
  return noop
}
