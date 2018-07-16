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
import {connect} from 'react-redux'
import {State} from '../state'
import {isUserSignedIn} from '../state/auth/authReducer'

const NoMatch = () => <Typography variant="title" color="inherit">404</Typography>

const Toolbar = () =>
  <div>
    <SignOut/>
    <Link to='/games'><button type="button">Games</button></Link>
    <Link to='/inviteFriend'><button>Invite</button></Link>
  </div>

interface AppProps {
  signedIn: boolean
}

export const AppComponent: SFC<AppProps> = ({signedIn}) =>
  <div>
    {
      signedIn
        ?
          <Fragment>
            <Toolbar/>
            <Switch>
              <Route exact={true} path='/'>
                {() => <Redirect to='/games'/>}
              </Route>
              <Route path='/games/new' component={NewGame}/>
              <Route path='/games' component={Games}/>
              <Route path='/addFriend/:playerId' component={AddFriend}/>
              <Route path='/inviteFriend' component={InviteFriend}/>
              <Route component={NoMatch}/>
            </Switch>
          </Fragment>
        :
          <SignIn/>
    }
  </div>

const mapStateToProps = (state: State): AppProps => ({
  signedIn: isUserSignedIn(state)
})

export const App = connect(mapStateToProps)(AppComponent)