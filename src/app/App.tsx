import * as React from 'react'
import {SFC, Fragment} from 'react'
import {Link, Redirect, Route, Switch} from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import {Games} from '../state/games/Games'
import {SignOut} from '../state/auth/SignOut'
import {NewGame} from '../state/games/NewGame'
import {SignIn} from '../state/auth/SignIn'
import {AddFriend} from '../state/friends/AddFriend'
import {InviteFriend} from '../state/friends/InviteFriend'
import {connect, MapStateToProps} from 'react-redux'
import {State} from '../state'
import {isUserSignedIn, isEmailVerified, getUserName} from '../state/auth/authReducer'
import {EditAddress} from '../state/users/EditAddress'
import {VerifyEmail} from '../state/auth/VerifyEmail'

const NoMatch = () => <Typography variant="title" color="inherit">404</Typography>

const Toolbar: SFC<{name: string}> = ({name}) =>
  <div>
    <Typography>{name}</Typography>
    <SignOut/>
    <Link to='/games'><button type="button">Games</button></Link>
    <Link to='/inviteFriend'><button>Invite</button></Link>
  </div>

interface AppProps {
  signedIn: boolean,
  verified: boolean,
  name?: string
}

export const AppComponent: SFC<AppProps> = ({signedIn, verified, name}) =>
  <div>
    {
      signedIn
        ?
        verified
          ?
          <Fragment>
            <Toolbar name={name!}/>
            <Switch>
              <Route exact={true} path='/'>
                {() => <Redirect to='/games'/>}
              </Route>
              <Route path='/games/new' component={NewGame}/>
              <Route path='/games' component={Games}/>
              <Route path='/addFriend/:playerId' component={AddFriend}/>
              <Route path='/inviteFriend' component={InviteFriend}/>
              <Route path='/address' component={EditAddress}/>
              <Route component={NoMatch}/>
            </Switch>
          </Fragment>
          :
          <VerifyEmail/>
        :
        <SignIn/>
    }
  </div>

const mapStateToProps: MapStateToProps<AppProps, {}, State> = (state: State): AppProps => ({
  signedIn: isUserSignedIn(state),
  verified: isEmailVerified(state),
  name: isUserSignedIn(state) ? getUserName(state) : ''
})

export const App = connect(mapStateToProps)(AppComponent)