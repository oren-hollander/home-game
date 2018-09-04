import * as React from 'react'
import {connect, MapDispatchToProps} from 'react-redux'
import {signOut} from './authActions'
import { HomeGameThunkDispatch } from '../state'
import Button from '@material-ui/core/Button'

interface SignOutProps {
  signOut: () => void
}

namespace UI {
  export const SignOut = ({ signOut }: SignOutProps) => <Button color="primary" variant="contained" onClick={signOut}>Sign Out</Button>
}

const mapDispatchToProps: MapDispatchToProps<SignOutProps, {}> = (dispatch: HomeGameThunkDispatch) => ({
  signOut: () => dispatch(signOut())
})

export const SignOut = connect(undefined, mapDispatchToProps)(UI.SignOut)