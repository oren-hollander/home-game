import {call, put, Effect, takeEvery, all} from 'redux-saga/effects'
import * as firebase from 'firebase/app'
import 'firebase/auth'
import { push, replace } from 'connected-react-router'

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

export function* verifyEmailSaga(verifyEmail: VerifyEmail): Iterator<Effect> {
  try {
    const auth = firebase.auth()
    const applyActionCode = auth.applyActionCode.bind(auth)

    yield call(applyActionCode, verifyEmail.oobCode)
    yield put(emailVerified())
  }
  catch (e) {
    yield put(emailNotVerified(e.message))
  }
}

function* userSignedInSaga(): Iterator<Effect> {
  yield put(push('/games'))
}

function* userSignedOutSaga(): Iterator<Effect> {
  yield put(replace('/'))
}

function* signInSaga(signIn: SignIn): Iterator<Effect> {
  yield(call(() => firebase.auth().signInWithEmailAndPassword(signIn.email, signIn.password)))
}

export function* authSaga(): Iterator<Effect> {
  yield all([
    takeEvery(VERIFY_EMAIL, verifyEmailSaga),
    takeEvery(USER_SIGNED_IN, userSignedInSaga),
    takeEvery(USER_SIGNED_OUT, userSignedOutSaga),
    takeEvery(SIGN_IN, signInSaga)
  ])
}

