import * as React from 'react'
import { SFC } from 'react'
import { Switch, Route, RouteComponentProps } from 'react-router-dom'
import { Home } from './Home'
import { NewGame } from '../games/NewGame'
import { Games } from '../games/Games'
import { AcceptFriendInvitation } from '../friends/AcceptFriendInvitation'
import { InviteFriend } from '../friends/InviteFriend'
import { AddAddress } from '../addresses/AddAddress'
import { Addresses } from '../addresses/Addresses'
import { Friends } from '../friends/Friends'
import { GameView } from '../games/GameView'
import { EditAddress } from '../addresses/EditAddress';

const NoMatch: SFC = () => <>404</>

const GameById: SFC<RouteComponentProps<{ hostId: string; gameId: string }>> = ({ match }) => (
  <GameView hostId={match.params.hostId} gameId={match.params.gameId} />
)

const EditAddressById: SFC<RouteComponentProps<{ addressId: string }>> = ({ match }) => (
  <EditAddress addressId={match.params.addressId} />
)

export const App: SFC = () => (
  <>
    <Switch>
      <Route path="/" exact={true} component={Home} />
      <Route path="/games/new" exact={true} component={NewGame} />
      {/* <Route path='/games/:gameId/invite' exact={true} component={InviteToGameById} /> */}
      <Route path="/games/:hostId/:gameId" exact={true} component={GameById} />
      <Route path="/games" exact={true} component={Games} />
      <Route path="/friends/accept" exact={true} component={AcceptFriendInvitation} />
      <Route path="/friends/invite" exact={true} component={InviteFriend} />
      <Route path="/friends" exact={true} component={Friends} />
      <Route path="/addresses/new" exact={true} component={AddAddress} />
      <Route path="/addresses/:addressId" exact={true} component={EditAddressById} />
      <Route path="/addresses" exact={true} component={Addresses} />
      <Route component={NoMatch} />
    </Switch>
  </>
)
