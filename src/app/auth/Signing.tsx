import * as React from 'react'
import { SignIn } from './SignIn'
import { SignUp } from './SignUp'
import { Route, Switch } from 'react-router-dom'
// import { Toolbar } from '../../ui/Toolbar'
// import { Status } from '../status/Status'
// import { Link } from 'react-router-dom'
import { PasswordReset } from './PasswordReset'

// const SignInToolbarLinks = () => <><Link to="/sign-up">Sign Up</Link></>
// const SignUpToolbarLinks = () => <><Link to="/">Sign In</Link></>

export const Signing = () =>
  <div>
      {/* <Toolbar>
        <Switch>
          <Route path='/' exact={true} component={SignInToolbarLinks} />
          <Route path='/sign-up' exact={true} component={SignUpToolbarLinks} />
          <Route path='/reset-password' exact={true} component={SignUpToolbarLinks} />
        </Switch>
      </Toolbar> */}
      <Switch>
        <Route path='/' exact={true} component={SignIn} />
        <Route path='/sign-up' exact={true} component={SignUp} />
        <Route path='/reset-password' exatc={true} component={PasswordReset} />
      </Switch>
      {/* <Status/> */}
  </div>