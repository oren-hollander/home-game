import * as firebase from 'firebase/app'
import 'firebase/auth'
import { HomeGameAsyncThunkAction } from '../state'
import { createUserEffect } from '../users/usersActions'
import { showError, showStatus } from '../status/statusActions'
import { isEmpty } from 'lodash/fp'
import { push } from 'connected-react-router'
import { getUserEmail } from './authReducer'

export const EMAIL_VERIFIED = 'auth/email-verified'
export const EMAIL_NOT_VERIFIED = 'auth/email-not-verified'
export const USER_SIGNED_IN = 'auth/user-signed-in'
export const USER_SIGNED_OUT = 'auth/user-signed-out'

const emailVerified = () => ({type: EMAIL_VERIFIED as typeof EMAIL_VERIFIED})
export type EmailVerified = ReturnType<typeof emailVerified>

export const userSignedIn = (user: firebase.User) => ({type: USER_SIGNED_IN as typeof USER_SIGNED_IN, user})
export type UserSignedIn = ReturnType<typeof userSignedIn>

export const userSignedOut = () => ({type: USER_SIGNED_OUT as typeof USER_SIGNED_OUT})
export type UserSignedOut  = ReturnType<typeof userSignedOut>

export type AuthAction = EmailVerified | UserSignedIn | UserSignedOut 

export const sendEmailVerification = (): HomeGameAsyncThunkAction => async (dispatch, getState, { auth }) => {
  await auth.currentUser!.sendEmailVerification()
  const email = getUserEmail(getState())
  dispatch(showStatus(`Verification email sent to ${email}`))
}

export const verifyEmail = (oobCode: string): HomeGameAsyncThunkAction => async (dispatch, getState, { auth }) => {
  try {
    await auth.applyActionCode(oobCode)
    await auth.currentUser!.getIdToken(true)
    await auth.currentUser!.reload()
    dispatch(createUserEffect({ userId: auth.currentUser!.uid, name: auth.currentUser!.displayName! }))
    dispatch(push('/'))
    dispatch(emailVerified())
  }
  catch (e) {
    dispatch(showError(e.message))
  }
}

export const sendPasswordResetEmail = (email: string): HomeGameAsyncThunkAction => async (dispatch, getState, { auth} ) => {
  try {
    await auth.sendPasswordResetEmail(email)
    dispatch(showStatus(`Password reset email sent to ${email}`))

  }
  catch (e) {
    dispatch(showError(e.message))
  }
} 

export const resetPassword = (oobCode: string, password: string): HomeGameAsyncThunkAction => async (dispatch, getState, { auth }) => {
  try {
    await auth.verifyPasswordResetCode(oobCode)
    await auth.confirmPasswordReset(oobCode, password)
    dispatch(showStatus('Password successfully changed'))
    dispatch(push('/'))
  }
  catch (e) {
    dispatch(showError(e.message))
  }
}

export const signIn = (email: string, password: string): HomeGameAsyncThunkAction => async (dispatch, getState, { auth }) => {
  try {
    await auth.signInWithEmailAndPassword(email, password)
  }
  catch (e) {
    dispatch(showError(e.message))
  }
}

export const signOut = (): HomeGameAsyncThunkAction => async (dispatch, getState, { auth }) => {
  auth.signOut()
  dispatch(push('/'))
}

export const registerUser = (email: string, name: string, password: string): HomeGameAsyncThunkAction => async (dispatch, getState, { auth }) => {
  if (isEmpty(name)) {
    dispatch(showError('You must provide a name'))
    return
  }
  try {
    const credentials = await auth.createUserWithEmailAndPassword(email, password)
    const user = credentials.user!
    await user.updateProfile({ displayName: name, photoURL: null })
    // await user.getIdToken(true)
    // await user.reload()
    dispatch(userSignedIn(credentials.user!))
    dispatch(push('/'))
  }
  catch(e) { 
    dispatch(showError(e.message))
  }
}