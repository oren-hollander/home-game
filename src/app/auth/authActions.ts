import * as firebase from 'firebase/app'
import 'firebase/auth'
import {Action, Dispatch, MiddlewareAPI} from 'redux'
import {Services} from '../../services/services'
import {createEffectHandler, Effect, EffectMap} from '../../effect/effect'
import {State} from '../state'
import {User} from '../../db/types'
import {setUser} from '../users/usersActions'

export const SEND_EMAIL_VERIFICATION = 'auth/send-email-verification'
export const VERIFY_EMAIL = 'auth/verify-email'
export const RESET_PASSWORD = 'auth/reset-password'
export const EMAIL_VERIFIED = 'auth/email-verified'
export const EMAIL_NOT_VERIFIED = 'auth/email-not-verified'
export const USER_SIGNED_IN = 'auth/user-signed-in'
export const USER_SIGNED_OUT = 'auth/user-signed-out'
export const SIGN_IN = 'auth/sign-in'
export const SIGN_OUT = 'auth/sign-out'

export const sendEmailVerification = () => ({type: SEND_EMAIL_VERIFICATION as typeof SEND_EMAIL_VERIFICATION})
export type SendEmailVerification = ReturnType<typeof sendEmailVerification>

const emailVerified = () => ({type: EMAIL_VERIFIED as typeof EMAIL_VERIFIED})
export type EmailVerified = ReturnType<typeof emailVerified>

const emailNotVerified = (message: string) => ({type: EMAIL_NOT_VERIFIED as typeof EMAIL_NOT_VERIFIED, message})
export type EmailNotVerified  = ReturnType<typeof emailNotVerified>

export const userSignedIn = (user: firebase.User) => ({type: USER_SIGNED_IN as typeof USER_SIGNED_IN, user})
export type UserSignedIn = ReturnType<typeof userSignedIn>

export const userSignedOut = () => ({type: USER_SIGNED_OUT as typeof USER_SIGNED_OUT})
export type UserSignedOut  = ReturnType<typeof userSignedOut>

export const verifyEmail = (oobCode: string) => ({ type: VERIFY_EMAIL as typeof VERIFY_EMAIL, oobCode })
export type VerifyEmail = ReturnType<typeof verifyEmail>

export const resetPassword = (oobCode: string) => ({ type: RESET_PASSWORD as typeof RESET_PASSWORD, oobCode })
export type ResetPassword = ReturnType<typeof resetPassword>

export const signIn = (email: string, password: string) => ({type: SIGN_IN as typeof SIGN_IN, email, password})
export type SignIn = ReturnType<typeof signIn>

export const signOut = () => ({type: SIGN_OUT as typeof SIGN_OUT})
export type SignOut = ReturnType<typeof signOut>

export type AuthAction = SendEmailVerification | VerifyEmail | ResetPassword | EmailVerified | EmailNotVerified | UserSignedIn | UserSignedOut | SignIn | SignOut

export const sendEmailVerificationEffect: Effect<VerifyEmail> = async (verifyEmail: VerifyEmail, store: MiddlewareAPI<Dispatch, State>, {auth}: Services) => {
  auth.currentUser!.sendEmailVerification()
}

export const verifyEmailEffect: Effect<VerifyEmail> = async (verifyEmail: VerifyEmail, store: MiddlewareAPI<Dispatch, State>, { auth }: Services) => {
  try {
    await auth.applyActionCode(verifyEmail.oobCode)
    store.dispatch(emailVerified())
  }
  catch (e) {
    store.dispatch(emailNotVerified(e.message))
  }
}

export const resetPasswordEffect: Effect<ResetPassword> = async (resetPassword: ResetPassword, store: MiddlewareAPI<Dispatch, State>, { auth }: Services) => {
  await auth.applyActionCode(resetPassword.oobCode)
}

const signInEffect: Effect<SignIn> = (signIn, store, services) => {
  services.auth.signInWithEmailAndPassword(signIn.email, signIn.password)
}

const signOutEffect: Effect<SignOut> = (signOut, store, {auth}) => {
  auth.signOut()
}

const userSignedInEffect: Effect<UserSignedIn> = async (userSignedIn, store, {db}) => {
  const userSnapshot = await db.collection('users').doc(userSignedIn.user.uid).get()
  const user: User = userSnapshot.data()! as User
  store.dispatch(setUser(user))
}

const x: EffectMap<Action<string>> = {
  [SIGN_IN]: signInEffect,
  [SIGN_OUT]: signOutEffect,
  [VERIFY_EMAIL]: verifyEmailEffect,
  [SEND_EMAIL_VERIFICATION]: sendEmailVerificationEffect,
  [USER_SIGNED_IN]: userSignedInEffect,
  [RESET_PASSWORD]: resetPasswordEffect
}

export const authEffects = createEffectHandler(x)