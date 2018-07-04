import {Reducer} from 'redux'
import {EMAIL_VERIFIED, EMAIL_NOT_VERIFIED, USER_SIGNED_IN, USER_SIGNED_OUT, AuthAction} from './authActions'
import {Selector} from 'reselect'

export interface AuthState {
  userId: string | null
  signedIn: boolean
  emailVerified: boolean
}

const defaultAuthState: AuthState = {
  userId: null,
  signedIn: false,
  emailVerified: false
}

export const reducer: Reducer<AuthState> = (state: AuthState = defaultAuthState, action: AuthAction) => {
  switch(action.type){
    case EMAIL_VERIFIED:
      return {...state, emailVerified: true}
    case EMAIL_NOT_VERIFIED:
      return {...state, emailVerified: false}
    case USER_SIGNED_IN:
      return {...state, signedIn: true, userId: action.user.uid, emailVerified: action.user.emailVerified}
    case USER_SIGNED_OUT:
      return {...state, signedIn: false, userId: null, emailVerified: false}
    default:
      return state
  }
}


export const isUserSignedIn: Selector<AuthState, boolean> = (state: AuthState): boolean => state.signedIn
export const isEmailVerified: Selector<AuthState, boolean> = (state: AuthState): boolean => state.emailVerified
