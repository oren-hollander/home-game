import * as React from 'react'
import { SFC } from 'react'
import { connect, MapStateToProps } from 'react-redux'
import { State } from '../state'
import { getUser } from '../auth/authReducer'
import { Switch, Route } from 'react-router-dom'
import { Home } from './Home'
import { NewGame } from '../games/NewGame'
import { Games } from '../games/Games'
import { AcceptFriendInvitation } from '../friends/AcceptFriendInvitation'
import { InviteFriend } from '../friends/InviteFriend'
import { AddAddress } from '../addresses/AddAddress'
import { Addresses } from '../addresses/Addresses'
import { Friends } from '../friends/Friends'

const NoMatch: SFC = () => <>404</>

interface AppProps {
  userId: string
}

namespace UI {
  //   <EditAddress addressId={match.params.addressId} />
  // )
  // const GameById: SFC<RouteComponentProps<GameViewProps>> = ({ match }) => (
    // <GameView hostId={match.params.hostId} gameId={match.params.gameId} />
  // )

  export const App: SFC<AppProps> = ({ userId }) => (
    <>
      <Switch>
        <Route path="/" exact={true} component={Home} />
        <Route path="/games/new" exact={true} component={NewGame} />
        {/* <Route path='/games/:gameId/invite' exact={true} component={InviteToGameById} /> */}
        {/* <Route path="/games/:hostId/:gameId" exact={true} component={GameById} /> */}
        <Route path="/games" exact={true} component={Games} />
        <Route path="/friends/accept" exact={true} component={AcceptFriendInvitation} />
        <Route path="/friends/invite" exact={true} component={InviteFriend} />
        <Route path="/friends" exact={true} component={Friends} />
        <Route path="/addresses/new" exact={true} component={AddAddress} />
        {/* <Route path="/addresses/:addressId" exact={true} component={EditAddressById} /> */}
        <Route path="/addresses" exact={true} component={Addresses} />
        <Route component={NoMatch} />
      </Switch>
    </>
  )
}

const mapStateToProps: MapStateToProps<AppProps, {}, State> = (state: State): AppProps => ({
  userId: getUser(state).userId
})

export const App = connect(mapStateToProps)(UI.App)
