import * as React from 'react'
import { SFC, ComponentType } from 'react'
import { Game, InvitationResponse, User } from '../../db/types'
import { listenToGameAndFriends, GameId } from './gamesActions'
import { getGameAndFriends, GameAndFriends } from './gamesReducer'
import { Page } from '../../ui/Page'
import { identity, map, isUndefined } from 'lodash/fp'
import { Jumbotron } from 'reactstrap'
import { DateView } from '../../ui/DateView'
import { HostedGamePlayerLists, InvitedGamePlayerLists } from './PlayerLists'
import { dataLoader, CompProps } from '../../data/dataLoader'
import { markStale, markFresh } from '../dataStatus/dataStatusActions'
import { getDataStatus } from '../dataStatus/dataStatusReducer'
import { Loading } from '../../ui/Loading'

namespace UI {
  interface GameViewProps {
    readonly fresh: boolean
    readonly userId: string
    readonly game?: Game
    readonly invitedPlayers: ReadonlyArray<User>
    readonly responses: ReadonlyArray<InvitationResponse>
    readonly friends: ReadonlyArray<User>
  }
  const Players: SFC<GameViewProps> = ({ userId, friends, game, invitedPlayers, responses }) => {
    const invitedPlayerIds = map(user => user.userId, invitedPlayers)

    if (isUndefined(game)) {
      return null
    }

    if (userId === game.hostId) {
      return (
        <HostedGamePlayerLists game={game} friends={friends} invitedUserIds={invitedPlayerIds} responses={responses} />
      )
    }

    return <InvitedGamePlayerLists invitedUsers={invitedPlayers} responses={responses} />
  }

  export const GameView: SFC<GameViewProps> = ({ userId, friends, game, invitedPlayers, responses, fresh }) => (
    <Page>
      <Jumbotron>
        <Loading fresh={fresh} />
        {game && (
          <>
            <h5>Host</h5>
            <p>{game.hostName}</p>
            <h5>Time</h5>
            <p>
              <DateView timestamp={game.timestamp} />
            </p>
            <h5>Address</h5>
            <p>
              {game.address.houseNumber} {game.address.street}, {game.address.city} ({game.address.notes})
            </p>
            {game && (
              <Players
                fresh={fresh}
                game={game}
                userId={userId}
                friends={friends}
                invitedPlayers={invitedPlayers}
                responses={responses}
              />
            )}
          </>
        )}
      </Jumbotron>
    </Page>
  )
}

// export type GameViewProps = GameId

// const mapStateToProps = (state: State, ownProps: GameViewProps): GameViewStateProps => {
//   const gameState = getGame(state, ownProps)
//   const friends = getFriends(state)
//   const userId = getUser(state).userId

//   return {
//     userId,
//     game: gameState && gameState.game,
//     invitedPlayers: gameState ? gameState.invitedPlayers : [],
//     responses: gameState ? gameState.responses : [],
//     friends
//   }
// }

const GameViewAdapter: SFC<CompProps<GameAndFriends | undefined>> = ({ data, dataStatus }) => {
  if (!data) {
    return null
  }

  return (
    <UI.GameView
      fresh={dataStatus === 'fresh'}
      userId=""
      invitedPlayers={data.game.invitedPlayers}
      responses={data.game.responses}
      friends={data.friends}
      game={data.game.game}
    />
  )
}

export type GameViewProps = GameId

const mapProps: (props: GameViewProps) => GameViewProps = identity

export const GameView: ComponentType<GameId> = dataLoader(
  mapProps,
  listenToGameAndFriends,
  markStale('games'),
  markFresh('games'),
  getGameAndFriends,
  getDataStatus('games')
)(GameViewAdapter)
