import * as React from 'react'
import { SFC, ComponentType } from 'react'
import { Game, InvitationResponse, User } from '../../db/types'
import { listenToGame } from './gamesActions'
import { getGame } from './gamesReducer'
import { listen } from '../../data/listen'
import { compose } from 'recompose'
import { State } from '../state'
import { connect } from 'react-redux'
import { Page } from '../../ui/Page'
import { map, noop, constant, isUndefined } from 'lodash/fp'
import { Jumbotron } from 'reactstrap'
import { DateView } from '../../ui/DateView'
import { getUser } from '../auth/authReducer'
import { HostedGamePlayerLists, InvitedGamePlayerLists } from './PlayersLists'
import { load } from '../../data/load'
import { loadFriends } from '../friends/friendsActions'
import { getFriends } from '../friends/friendsReducer'

interface GameViewStateProps {
  readonly userId: string
  readonly game?: Game
  readonly invitedPlayers: ReadonlyArray<User>
  readonly responses: ReadonlyArray<InvitationResponse>
  readonly friends: ReadonlyArray<User>
}

namespace UI {
  const Players: SFC<GameViewStateProps> = ({ userId, friends, game, invitedPlayers, responses }) => {
    const invitedPlayerIds = map(user => user.userId, invitedPlayers)

    if (isUndefined(game)) {
      return null
    }

    if (userId === game.hostId) {
      return <HostedGamePlayerLists friends={friends} invitedUserIds={invitedPlayerIds} responses={responses} /> 
    }

    return <InvitedGamePlayerLists invitedUsers={invitedPlayers} responses={responses} /> 
  } 

  export const GameView: SFC<GameViewStateProps> = ({ userId, friends, game, invitedPlayers, responses }) => 
    <Page>
      <Jumbotron>
        {
          !game 
            ? 'Loading' 
            : 
            <>
              <h5>Host</h5>
              <p>{game.hostName}</p> 
              <h5>Time</h5>
              <p><DateView timestamp={game.timestamp}/></p> 
              <h5>Address</h5>
              <p>{game.address.houseNumber} {game.address.street}, {game.address.city} ({game.address.notes})</p>
              { 
                game && 
                <Players game={game} userId={userId} friends={friends} invitedPlayers={invitedPlayers} responses={responses}/> 
              }
            </>
        }
      </Jumbotron>
    </Page>
}

export interface GameViewProps {
  gameId: string
}

const mapStateToProps = (state: State, ownProps: GameViewProps): GameViewStateProps => {
  const gameState = getGame(state, ownProps)
  const friends = getFriends(state)
  const userId = getUser(state).userId

  return {
    userId,
    game: gameState && gameState.game,
    invitedPlayers: gameState ? gameState.invitedPlayers: [],
    responses: gameState ? gameState.responses : [],
    friends
  }
}

export const GameView: ComponentType<GameViewProps> = compose(
  load(loadFriends),
  listen(listenToGame, constant(noop), 'gameId'),
  connect(mapStateToProps)
)(UI.GameView) as ComponentType<GameViewProps>
