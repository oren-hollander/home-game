import * as React from 'react'
import { Dictionary } from 'lodash'
import { SFC, Component, ComponentType } from 'react'
import { User, InvitationResponse, InvitationStatus, Invitation } from '../../db/types'
import {
  map,
  flow,
  filter,
  keys,
  keyBy,
  difference,
  isEmpty,
  get,
  groupBy,
  defaultTo,
  fromPairs,
  some,
  eq,
  toPairs
} from 'lodash/fp'
import ListGroup from 'reactstrap/lib/ListGroup'
import ListGroupItem from 'reactstrap/lib/ListGroupItem'
import { Button } from 'reactstrap'
import { connect } from 'react-redux'
import { HomeGameThunkDispatch } from '../state'
import { invitePlayers } from './gamesActions'
import { GameAndInvitation } from './gamesReducer';

type Users = ReadonlyArray<User>
type UserIds = ReadonlyArray<string>

export interface HostedGamePlayerLists {
  approved: Users
  standBy: Users
  declined: Users
  noResponse: Users
  notInvited: Users
}

export interface InvitedGamePlayerLists {
  approved: Users
  standBy: Users
  declined: Users
  noResponse: Users
}

export const groupInvitedGamePlayersByInvitationStatus = (
  invitedUsers: Users,
  responses: ReadonlyArray<InvitationResponse>
): InvitedGamePlayerLists => {
  const responseMap = keyBy(response => response.playerId, responses)
  const playerLists = (groupBy(
    user => defaultTo('noResponse', get([user.userId, 'status'], responseMap)),
    invitedUsers
  ) as {}) as InvitedGamePlayerLists

  return playerLists
}

export const groupHostedGamePlayersByInvitationStatus = (
  players: Users,
  invitedUserIds: UserIds,
  responses: ReadonlyArray<InvitationResponse>
): HostedGamePlayerLists => {
  if (isEmpty(players)) {
    return {
      approved: [],
      standBy: [],
      declined: [],
      noResponse: [],
      notInvited: []
    }
  }
  const byStatus = (status: InvitationStatus) => (response: InvitationResponse): boolean => response.status === status
  const getPlayerId = (response: InvitationResponse): string => response.playerId
  const getUserId = (user: User): string => user.userId

  const playerMap = keyBy(getUserId, players)
  const getPlayer = (userId: string): User => playerMap[userId]

  const getUsersByStatus = (status: InvitationStatus): ReadonlyArray<User> =>
    flow(
      filter(byStatus(status)),
      map(
        flow(
          getPlayerId,
          getPlayer
        )
      )
    )(responses)

  const approved = getUsersByStatus('approved')

  const standBy = getUsersByStatus('standBy')
  const declined = getUsersByStatus('declined')

  const respondingUserIds = map(getPlayerId, responses)
  const noResponse = map(getPlayer, difference(invitedUserIds, respondingUserIds))
  const notInvited = map(getPlayer, difference(keys(playerMap), invitedUserIds))

  return {
    approved,
    standBy,
    declined,
    noResponse,
    notInvited
  }
}

interface HostedGamePlayerListsProps {
  game: GameAndInvitation
  friends: ReadonlyArray<User>
}

interface OwnGamePlayerListsProps {
  game: GameAndInvitation
}

type PlayerListProps = {
  label: string
  users: ReadonlyArray<User>
}

const PlayerList: SFC<PlayerListProps> = ({ users, label }) => {
  if (isEmpty(users)) {
    return null
  }

  return (
    <>
      <h5>{label}</h5>
      <ListGroup>
        {map(
          user => (
            <ListGroupItem key={user.name}>{user.name}</ListGroupItem>
          ),
          users
        )}
      </ListGroup>
    </>
  )
}

type NotInvitedPlayerListStateProps = {
  game: GameAndInvitation
  users: ReadonlyArray<User>
}

type NotInvitedPlayerListDispatchProps = {
  invitePlayers(userIds: ReadonlyArray<string>): void
}

type NotInvitedPlayerListProps = NotInvitedPlayerListStateProps & NotInvitedPlayerListDispatchProps
type NotInvitedPlayerListState = Dictionary<boolean>

namespace UI {
  export class NotInvitedPlayerList extends Component<NotInvitedPlayerListProps, NotInvitedPlayerListState> {
    state: Dictionary<boolean> = flow(
      map((user: User) => [user.userId, false]),
      fromPairs
    )(this.props.users)

    toggleUser = (userId: string) => () => this.setState({ [userId]: !get(userId, this.state) })

    getColor = (userId: string): string => (this.state[userId] ? 'primary' : 'secondary')

    inviteSelectedPlayers = () => {
      const pairs = toPairs(this.state)
      const invited = filter(([, invite]) => invite, pairs)
      const friendIds = map(([userId]) => userId, invited)
      this.props.invitePlayers(friendIds)
    }

    areAnySelected = () => some(eq(true), this.state)

    render() {
      if (isEmpty(this.props.users)) {
        return null
      }

      return (
        <>
          <h5>Invite Friends</h5>
          <ListGroup>
            {map(
              user => (
                <ListGroupItem
                  key={user.userId}
                  color={this.getColor(user.userId)}
                  onClick={this.toggleUser(user.userId)}
                >
                  {user.name}
                </ListGroupItem>
              ),
              this.props.users
            )}
          </ListGroup>
          <p />
          <Button color="primary" disabled={!this.areAnySelected()} onClick={this.inviteSelectedPlayers}>
            Invite Selected Players
          </Button>
        </>
      )
    }
  }
}

const mapDispatchToProps = (
  dispatch: HomeGameThunkDispatch,
  ownProps: NotInvitedPlayerListStateProps
): NotInvitedPlayerListDispatchProps => ({
  invitePlayers(userIds: ReadonlyArray<string>) {
    const invitation: Invitation = {
      gameId: ownProps.game.game.gameId,
      hostId: ownProps.game.game.hostId
    }
    dispatch(invitePlayers(invitation, userIds))
  }
})

const NotInvitedPlayerList: ComponentType<NotInvitedPlayerListStateProps> = connect(
  undefined,
  mapDispatchToProps
)(UI.NotInvitedPlayerList)

export const HostedGamePlayerLists: SFC<HostedGamePlayerListsProps> = ({
  game,
  friends
}) => {
  const invitedPlayerIds = map(player => player.userId, game.invitedPlayers)
  const playerLists = groupHostedGamePlayersByInvitationStatus(friends, invitedPlayerIds, game.invitationResponses)
  return (
    <>
      <PlayerList label="Approved" users={playerLists.approved} />
      <PlayerList label="Stand By" users={playerLists.standBy} />
      <PlayerList label="Declined" users={playerLists.declined} />
      <PlayerList label="Didn't respond" users={playerLists.noResponse} />
      <NotInvitedPlayerList game={game} users={playerLists.notInvited} />
    </>
  )
}

export const InvitedGamePlayerLists: SFC<OwnGamePlayerListsProps> = ({ game }) => {
  const playerLists = groupInvitedGamePlayersByInvitationStatus(game.invitedPlayers, game.invitationResponses)
  return (
    <>
      <PlayerList label="Approved" users={playerLists.approved} />
      <PlayerList label="Stand By" users={playerLists.standBy} />
      <PlayerList label="Declined" users={playerLists.declined} />
      <PlayerList label="Didn't respond" users={playerLists.noResponse} />
    </>
  )
}
