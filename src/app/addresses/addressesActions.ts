import { Address } from '../../db/types'
import { HomeGameAsyncThunkAction } from '../state'
import { getUser } from '../auth/authReducer'
import { push } from 'connected-react-router'
import { SuccessStatus, showStatus} from '../status/statusActions'
export const SET_ADDRESSES = 'addresses/set'

export const setAddresses = (addresses: ReadonlyArray<Address>) => ({ type: SET_ADDRESSES as typeof SET_ADDRESSES, addresses })
export type SetAddresses = ReturnType<typeof setAddresses>

export type AddressesAction = SetAddresses 

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
  dispatch(setAddresses(addresses))
}