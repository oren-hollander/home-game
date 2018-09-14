import * as React from 'react'
import { connect, MapDispatchToProps } from 'react-redux'
import { signOut } from './authActions'
import { HomeGameThunkDispatch } from '../state'
import { Button } from 'reactstrap'

interface SignOutProps {
  signOut: () => void
}

namespace UI {
  export const SignOut = ({ signOut }: SignOutProps) => (
    <Button color="light" outline={true} onClick={signOut}>
      Sign Out
    </Button>
  )
}

const mapDispatchToProps: MapDispatchToProps<SignOutProps, {}> = (dispatch: HomeGameThunkDispatch) => ({
  signOut: () => dispatch(signOut())
})

export const SignOut = connect(
  undefined,
  mapDispatchToProps
)(UI.SignOut)
