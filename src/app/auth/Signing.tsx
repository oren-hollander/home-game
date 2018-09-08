import * as React from 'react'
import { SignIn } from './SignIn'
import { SignUp } from './SignUp'
import { Route, Switch } from 'react-router-dom'
import { PasswordReset } from './PasswordReset'

export const Signing = () =>
  <div>
      <Switch>
        <Route path='/' exact={true} component={SignIn} />
        <Route path='/sign-up' exact={true} component={SignUp} />
        <Route path='/reset-password' exatc={true} component={PasswordReset} />
      </Switch>
  </div>