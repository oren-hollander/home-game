import * as React from 'react'
import { SFC } from 'react'
import { connect, MapStateToProps } from 'react-redux'
import { State } from '../state'
import { getUser } from '../auth/authReducer'
import { StatusBar } from '../../ui/StatusBar'
import { SignOut } from '../auth/SignOut'
import { Switch, Redirect, Route, RouteComponentProps } from 'react-router-dom'
import { NewGame } from '../games/NewGame'
import { Games } from '../games/Games'
import { AddFriend } from '../friends/AddFriend'
import { InviteFriend } from '../friends/InviteFriend'
import { AddAddress } from '../addresses/AddAddress'
import { Addresses } from '../addresses/Addresses'
import { EditAddress, EditAddressProps } from '../addresses/EditAddress'

const NoMatch: SFC = () => <>404</>

interface AppProps {
  name: string
}

namespace UI {
  const EditAddressById: SFC<RouteComponentProps<EditAddressProps>> = ({ match }) => <EditAddress addressId={match.params.addressId}/>

  export const App: SFC<AppProps> = ({ name }) => 
    <div>
      <div>
        {name}
        <SignOut/>
      </div>
      <Switch>
        <Route exact={true} path='/'>
          {() => <Redirect to='/games' />}
        </Route>
        <Route path='/games/new' component={NewGame} />
        <Route path='/games' component={Games} />
        <Route path='/addFriend' component={AddFriend} />
        <Route path='/inviteFriend' component={InviteFriend} />
        <Route path='/create-address' component={AddAddress} />
        <Route path='/addresses/:addressId' component={EditAddressById} />
        <Route path='/addresses' component={Addresses} />        
        <Route component={NoMatch} />
      </Switch> 
      <div>
        <StatusBar />
      </div>
    </div>
}

const mapStateToProps: MapStateToProps<AppProps, {}, State> = (state: State): AppProps => ({
  name: getUser(state).name 
})

export const App = connect(mapStateToProps)(UI.App)