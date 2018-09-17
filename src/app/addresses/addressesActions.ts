import { Address } from '../../db/types'
import { HomeGameAsyncThunkAction } from '../state'
import { getUser } from '../auth/authReducer'
import { push } from 'connected-react-router'
import { SuccessStatus, showStatus } from '../status/statusActions'
import { delay } from '../../util/delay'

export const SET_ADDRESSES = 'addresses/set-addresses'
export const SET_ADDRESS = 'addresses/set-address'
export const MARK_STALE = 'addresses/mark-stale'
export const MARK_FRESH = 'addresses/mark-fresh'

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

export const markStale = () => ({
  type: MARK_STALE as typeof MARK_STALE
})
export type MarkStale = ReturnType<typeof markStale>

export const markFresh = () => ({
  type: MARK_FRESH as typeof MARK_FRESH
})
export type MarkFresh = ReturnType<typeof markFresh>

export type AddressesAction = SetAddresses | SetAddress | MarkStale | MarkFresh

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

export const loadAddresses = (): HomeGameAsyncThunkAction => async (dispatch, getState, { db }) => {
  const userId = getUser(getState()).userId
  const addresses = await db.getAddresses(userId)
  await delay(3000)

  dispatch(setAddresses(addresses))
}

export const loadAddress = (addressId: string): HomeGameAsyncThunkAction => async (dispatch, getState, { db }) => {
  const userId = getUser(getState()).userId
  const address = await db.getAddress(userId, addressId)
  dispatch(setAddress(address))
}
