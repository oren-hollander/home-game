import * as React from 'react'
import { SFC, ComponentType } from 'react'
import { Dictionary } from 'lodash'
import { map, fromPairs, has, filter, includes } from 'lodash/fp'
import { ListGroup, ListGroupItem, ListGroupItemHeading, ListGroupItemText, Input, Button } from 'reactstrap'
import { User, InvitationResponse, InvitationStatus } from '../../db/types'
import { connect } from 'react-redux'
import { State } from '../state'
// import { invitePlayer } from './gamesActions'
import { getFriends } from '../friends/friendsReducer'
import { loadFriends } from '../friends/friendsActions'
import { compose } from 'recompose'
import { load } from '../../data/load'

const responseText = (
  response: InvitationStatus | 'no-response'
): 'Coming' | 'Not Coming' | 'Stand By' | 'No Response' => {
  switch (response) {
    case 'approved':
      return 'Coming'
    case 'declined':
      return 'Not Coming'
    case 'standBy':
      return 'Stand By'
    case 'no-response':
      return 'No Response'
  }
}

namespace UI {
  interface ResponseProps {
    name: string
    response: InvitationStatus | 'no-response'
  }

  const Response: SFC<ResponseProps> = ({ name, response }) => (
    <ListGroupItem>
      <ListGroupItemHeading>{name}</ListGroupItemHeading>
      <ListGroupItemText>{responseText(response)}</ListGroupItemText>
    </ListGroupItem>
  )

  export interface InviteToGameProps {
    readonly gameId: string
    readonly friends: ReadonlyArray<User>
    readonly invitedPlayers: ReadonlyArray<User>
    readonly responses: ReadonlyArray<InvitationResponse>
  }

  export const InviteToGame: SFC<InviteToGameProps> = ({ gameId, friends, invitedPlayers, responses }) => {
    const userResponses: Dictionary<InvitationResponse> = fromPairs(
      map(response => [response.playerId, response], responses)
    )

    const invitedPlayerIds = map(user => user.userId, invitedPlayers)

    const invitationResponses = map(
      player => ({
        name: player.userId,
        response: has(player.userId, userResponses)
          ? userResponses[player.userId].status
          : ('no-response' as InvitationStatus | 'no-response')
      }),
      invitedPlayers
    )

    const otherPlayers = filter(friend => !includes(friend.userId, invitedPlayerIds), friends)

    return (
      <>
        <h3>Invited Players</h3>
        <ListGroup>
          {map(
            response => (
              <Response key={response.name} name={response.name} response={response.response} />
            ),
            invitationResponses
          )}
        </ListGroup>

        <h3>Other players</h3>
        <ListGroup>
          {map(
            user => (
              <ListGroupItem key={user.name}>
                <ListGroupItemText>
                  <Input type="checkbox" />
                  {user.name}
                </ListGroupItemText>
              </ListGroupItem>
            ),
            otherPlayers
          )}
          <Button>Invite</Button>
        </ListGroup>
      </>
    )
  }
}

interface InviteToGameProps {
  readonly gameId: string
  readonly invitedPlayers: ReadonlyArray<User>
  readonly responses: ReadonlyArray<InvitationResponse>
}

const mapStateToProps = (state: State, ownProps: { gameId: string }) => ({
  friends: getFriends(state)
})

export const InviteToGame = compose(
  load(loadFriends),
  connect(mapStateToProps)
)(UI.InviteToGame) as ComponentType<InviteToGameProps>
