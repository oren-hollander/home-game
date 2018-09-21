import * as React from 'react'
import { SFC } from 'react'
import { Game, InvitationResponse, User } from '../../db/types'
import { Page } from '../../ui/Page'
import { map, isUndefined } from 'lodash/fp'
import { Jumbotron } from 'reactstrap'
import { DateView } from '../../ui/DateView'
import { HostedGamePlayerLists, InvitedGamePlayerLists } from './PlayerLists'

interface GameViewProps {
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

export const GameView: SFC<GameViewProps> = ({ userId, friends, game, invitedPlayers, responses }) => (
  <Page>
    <Jumbotron>
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