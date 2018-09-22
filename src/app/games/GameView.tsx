import * as React from 'react'
import { SFC, ComponentType } from 'react'
import { Page } from '../../ui/Page'
import { Jumbotron } from 'reactstrap'
import { DateView } from '../../ui/DateView'
import { HostedGamePlayerLists, InvitedGamePlayerLists } from './PlayerLists'
import { GameAndInvitation, getGame } from './gamesReducer'
import { User } from '../../db/types'
import { connect } from 'react-redux'
import { State } from '../state'
import { getFriends } from '../friends/friendsReducer'

namespace UI {
  const Players: SFC<GameViewProps> = ({ userId, game, friends }) => {
    if (userId === game.game.hostId) {
      return <HostedGamePlayerLists game={game} friends={friends} />
    }

    return <InvitedGamePlayerLists game={game} />
  }

  export interface GameViewProps {
    readonly userId: string
    readonly game: GameAndInvitation
    readonly friends: ReadonlyArray<User>
  }

  export const GameView: SFC<GameViewProps> = ({ userId, friends, game }) => (
    <Page>
      <Jumbotron>
        {game && (
          <>
            <h5>Host</h5>
            <p>{game.game.hostName}</p>
            <h5>Time</h5>
            <p>
              <DateView timestamp={game.game.timestamp} />
            </p>
            <h5>Address</h5>
            <p>
              {game.game.address.houseNumber} {game.game.address.street}, {game.game.address.city} (
              {game.game.address.notes})
            </p>
            {game && <Players game={game} userId={userId} friends={friends} />}
          </>
        )}
      </Jumbotron>
    </Page>
  )
}

export interface GameViewProps {
  hostId: string
  gameId: string
}

const mapStateToProps = (state: State, ownProps: GameViewProps): UI.GameViewProps => ({
  userId: ownProps.hostId,
  game: getGame(state, ownProps.gameId),
  friends: getFriends(state)
})

export const GameView: ComponentType<GameViewProps> = connect<UI.GameViewProps, {}, GameViewProps, State>(
  mapStateToProps
)(UI.GameView)
