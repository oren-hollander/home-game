import * as React from 'react'
import { SFC } from 'react'
import { isUserSignedIn, isEmailVerified } from '../auth/authReducer'
import { State } from '../state'
import { connect, MapStateToProps } from 'react-redux'
import { EmailVerification } from './EmailVerification'
import { App } from '../app/App'
// import { App } from '../app/AppDemo'
import { Signing } from './Signing'
import { Route } from 'react-router-dom'

interface AuthenticationProps {
  signedIn: boolean,
  verified: boolean
}

namespace UI {
  export const Authentication: SFC<AuthenticationProps> = ({ signedIn, verified }) => {
    if (signedIn) {
      if (verified) {
        return <Route component={App} />
      }
      else {
        return <EmailVerification />
      }
    }
    else {
      return <Signing />
    }
  }
}

const mapStateToProps: MapStateToProps<AuthenticationProps, {}, State> = (state: State): AuthenticationProps => ({
  signedIn: isUserSignedIn(state),
  verified: isEmailVerified(state)
})

export const Authentication = connect(mapStateToProps)(UI.Authentication)