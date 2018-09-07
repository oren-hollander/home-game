import * as React from 'react'
import { SFC } from 'react'
import { connect, MapStateToProps } from 'react-redux'
import { State } from '../state'
import { getUser } from '../auth/authReducer'
import { Switch, Route, RouteComponentProps } from 'react-router-dom'
import { Home } from './Home'
import { NewGame } from '../games/NewGame'
import { Games } from '../games/Games'
import { AcceptFriendInvitation } from '../friends/AcceptFriendInvitation'
import { InviteFriend } from '../friends/InviteFriend'
import { AddAddress } from '../addresses/AddAddress'
import { Addresses } from '../addresses/Addresses'
import { EditAddress, EditAddressProps } from '../addresses/EditAddress'
import { Friends } from '../friends/Friends'
const NoMatch: SFC = () => <>404</>

interface AppProps {
  name: string
}

namespace UI {
  const EditAddressById: SFC<RouteComponentProps<EditAddressProps>> = ({ match }) => <EditAddress addressId={match.params.addressId}/>

  export const App: SFC<AppProps> = ({ name }) => 
    <>
      <Switch>
        <Route exact={true} path='/' component={Home}/>
        <Route path='/games/new' component={NewGame} />
        <Route path='/games' component={Games} />
        <Route path='/friends/accept' component={AcceptFriendInvitation} />
        <Route path='/friends/invite' component={InviteFriend} />
        <Route path='/friends' component={Friends} />
        <Route path='/addresses/new' component={AddAddress} />
        <Route path='/addresses/:addressId' component={EditAddressById} />
        <Route path='/addresses' component={Addresses} />        
        <Route component={NoMatch} />
      </Switch> 
    </>
}

const mapStateToProps: MapStateToProps<AppProps, {}, State> = (state: State): AppProps => ({
  name: getUser(state).name 
})

export const App = connect(mapStateToProps)(UI.App)