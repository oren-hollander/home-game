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
import { noop, constant } from 'lodash/fp'
import { Jumbotron } from 'reactstrap'
import { map } from 'lodash/fp'
import { DateView } from '../../ui/DateView'

interface GameViewStateProps {
  readonly game?: Game
  readonly invitedPlayers: ReadonlyArray<User>
  readonly responses: ReadonlyArray<InvitationResponse>
}

namespace UI {
  export const GameView: SFC<GameViewStateProps> = ({ game, invitedPlayers, responses }) => 
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
              <h5>Players</h5>
              {map(player => player.name, invitedPlayers)}
            </>
        }
      </Jumbotron>
    </Page>
}

const mapStateToProps = (state: State) => {
  const gameState = getGame(state)
  if (gameState) {
    return gameState
  }
  return {
    invitedPlayerIds: [],
    responses: []
  }
}
export interface GameViewProps {
  gameId: string
}

export const GameView: ComponentType<GameViewProps> = compose(
  listen(listenToGame, constant(noop), 'gameId'),
  connect(mapStateToProps)
)(UI.GameView) as ComponentType<GameViewProps>
