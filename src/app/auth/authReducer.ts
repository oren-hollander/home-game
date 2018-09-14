import { Reducer } from 'redux'
import { EMAIL_VERIFIED, USER_SIGNED_IN, USER_SIGNED_OUT, AuthAction } from './authActions'
import { Selector } from 'reselect'
import { State } from '../state'
import { User } from '../../db/types'

export interface AuthState {
  userId: string
  signedIn: boolean
  emailVerified: boolean
  name: string
  email: string
}

const defaultAuthState: AuthState = {
  userId: '',
  signedIn: false,
  emailVerified: false,
  name: '',
  email: ''
}

export const reducer: Reducer<AuthState> = (state: AuthState = defaultAuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case EMAIL_VERIFIED:
      return { ...state, emailVerified: true }
    case USER_SIGNED_IN:
      return {
        ...state,
        signedIn: true,
        userId: action.user.uid,
        emailVerified: action.user.emailVerified,
        name: action.user.displayName!,
        email: action.user.email!
      }
    case USER_SIGNED_OUT:
      return {
        ...state,
        signedIn: false,
        userId: '',
        emailVerified: false,
        name: '',
        email: ''
      }
    default:
      return state
  }
}

export const isUserSignedIn: Selector<State, boolean> = state => state.auth.signedIn
export const isEmailVerified: Selector<State, boolean> = state => state.auth.emailVerified
export const getUser: Selector<State, User> = state => ({ name: state.auth.name, userId: state.auth.userId })
export const getUserEmail: Selector<State, string> = state => state.auth.email
