import * as React from 'react'
import {connect, MapDispatchToProps} from 'react-redux'
import {signOut} from './authActions'
import { HomeGameThunkDispatch } from '../state'

interface SignOutProps {
  signOut: () => void
}

namespace UI {
  export const SignOut = ({ signOut }: SignOutProps) => <button onClick={signOut}>Sign Out</button>
}

const mapDispatchToProps: MapDispatchToProps<SignOutProps, {}> = (dispatch: HomeGameThunkDispatch) => ({
  signOut: () => dispatch(signOut())
})

export const SignOut = connect(undefined, mapDispatchToProps)(UI.SignOut)