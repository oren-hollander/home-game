import * as React from 'react'
import {connect} from 'react-redux'
import {State} from '../state'
import {isUserSignedIn} from './authReducer'
import {Dispatch} from 'redux'
import {signOut} from './authActions'

interface SignOutProps {
  isSignedIn: boolean,
  signOut: () => void
}

const SignOutComponent = ({isSignedIn, signOut}: SignOutProps) => isSignedIn ? <button onClick={signOut}>Sign Out</button> : null

const mapStateToProps = (state: State) => ({
  isSignedIn: isUserSignedIn(state)
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  signOut: () => {
    const so = signOut()
    dispatch(so)
  }
})

export const SignOut = connect(mapStateToProps, mapDispatchToProps)(SignOutComponent)