import * as firebase from 'firebase/app'
import 'firebase/auth'
import { push, replace } from 'connected-react-router'
import {Dispatch} from 'redux'
import {Services} from '../../app/services'
import {Effects} from '../../effect/effect'
import {GetState} from '../index'

export const VERIFY_EMAIL = 'verify-email'
export const EMAIL_VERIFIED = 'email-verified'
export const EMAIL_NOT_VERIFIED = 'email-not-verified'
export const USER_SIGNED_IN = 'user-signed-in'
export const USER_SIGNED_OUT = 'user-signed-out'
export const SIGN_IN = 'sign-in'

const emailVerified = () => ({type: EMAIL_VERIFIED as typeof EMAIL_VERIFIED})
export type EmailVerified  = ReturnType<typeof emailVerified>

const emailNotVerified = (message: string) => ({type: EMAIL_NOT_VERIFIED as typeof EMAIL_NOT_VERIFIED, message})
export type EmailNotVerified  = ReturnType<typeof emailNotVerified>

export const userSignedIn = (user: firebase.User) => ({type: USER_SIGNED_IN as typeof USER_SIGNED_IN, user})
export type UserSignedIn = ReturnType<typeof userSignedIn>

export const userSignedOut = () => ({type: USER_SIGNED_OUT as typeof USER_SIGNED_OUT})
export type UserSignedOut  = ReturnType<typeof userSignedOut>

export const verifyEmail = (oobCode: string) => ({type: VERIFY_EMAIL as typeof VERIFY_EMAIL, oobCode})
export type VerifyEmail = ReturnType<typeof verifyEmail>

export const signIn = (email: string, password: string) => ({type: SIGN_IN as typeof SIGN_IN, email, password})
export type SignIn = ReturnType<typeof signIn>

export type AuthAction = VerifyEmail | EmailVerified | EmailNotVerified | UserSignedIn | UserSignedOut | SignIn

export const verifyEmailEffect = async (verifyEmail: VerifyEmail, dispatch: Dispatch, getState: GetState, {auth}: Services) => {
  try {
    await auth.applyActionCode(verifyEmail.oobCode)
    dispatch(emailVerified())
  }
  catch (e) {
    dispatch(emailNotVerified(e.message))
  }
}

export const userSignedInEffect = async (userSignedIn: UserSignedIn, dispatch: Dispatch) => {
  dispatch(push('/games'))
}

export const userSignedOutEffect = async (userSignedOut: UserSignedOut, dispatch: Dispatch) => {
  dispatch(replace('/'))
}

const signInEffect = (signIn: SignIn, dispatch: Dispatch, getState: GetState, {auth}: Services) => {
  auth.signInWithEmailAndPassword(signIn.email, signIn.password)
}

export const authEffects: Effects = {
  [SIGN_IN]: signInEffect,
  [USER_SIGNED_IN]: userSignedInEffect,
  [USER_SIGNED_OUT]: userSignedOutEffect,
  [VERIFY_EMAIL]: verifyEmailEffect
}