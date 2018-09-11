import * as React from 'react'
import { SFC } from 'react'
import { User, InvitationResponse, InvitationStatus } from '../../db/types'
import { map, flow, filter, keys, keyBy, difference, isEmpty, get, groupBy, defaultTo } from 'lodash/fp'
import ListGroup from 'reactstrap/lib/ListGroup'
import ListGroupItem from 'reactstrap/lib/ListGroupItem'

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

export const groupInvitedGamePlayersByInvitationStatus = (invitedUsers: Users, responses: ReadonlyArray<InvitationResponse>): InvitedGamePlayerLists => {
  const responseMap = keyBy(response => response.playerId, responses)
  const playerLists = groupBy(user => defaultTo('no-response', get(user.userId, responseMap)), invitedUsers)

  // const byStatus = (status: InvitationStatus) => (response: InvitationResponse): boolean => response.status === status
  // const getPlayerId = (response: InvitationResponse): string => response.playerId
  // const getUserId = (user: User): string => user.name

  // const playerMap = keyBy(getUserId, invitedUsers)
  // const getPlayer: (userId: string) => User = get(_, playerMap)

  // const getUsersByStatus = (status: InvitationStatus): ReadonlyArray<User> =>
  //   flow(
  //     filter(byStatus(status)),
  //     map(flow(getPlayerId, getPlayer)),
  //   )(responses)

  // const approved = getUsersByStatus('approved')
  // const standBy = getUsersByStatus('stand-by')
  // const declined = getUsersByStatus('declined')

  // const respondingUserIds = map(getPlayerId, responses)
  // const noResponse = map(getPlayer, difference(keys(invitedUsers), respondingUserIds))

  return {
    approved: playerLists['approved'],
    standBy: playerLists['stand-by'],
    declined: playerLists['declined'],
    noResponse: playerLists['no-reponse']
  }
}

export const groupHostedGamePlayersByInvitationStatus = (players: Users, invitedUserIds: UserIds, responses: ReadonlyArray<InvitationResponse>): HostedGamePlayerLists => {
  const byStatus = (status: InvitationStatus) => (response: InvitationResponse): boolean => response.status === status
  const getPlayerId = (response: InvitationResponse): string => response.playerId
  const getUserId = (user: User): string => user.name

  const playerMap = keyBy(getUserId, players)
  const getPlayer = (userId: string): User => playerMap[userId]

  const getUsersByStatus = (status: InvitationStatus): ReadonlyArray<User> =>
    flow(
      filter(byStatus(status)),
      map(flow(getPlayerId, getPlayer)),
    )(responses)

  const approved = getUsersByStatus('approved')
  const standBy = getUsersByStatus('stand-by')
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
  friends: ReadonlyArray<User>
  invitedUserIds: ReadonlyArray<string>
  responses: ReadonlyArray<InvitationResponse>
}

interface OwnGamePlayerListsProps {
  invitedUsers: ReadonlyArray<User>
  responses: ReadonlyArray<InvitationResponse>
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
        <h4>{label}</h4>
        <ListGroup>
          { map(user => <ListGroupItem>{user.name}</ListGroupItem> , users) }
        </ListGroup>
      </>
    )
}

export const HostedGamePlayerLists: SFC<HostedGamePlayerListsProps> = ({ friends, invitedUserIds, responses }) => {
  const playerLists = groupHostedGamePlayersByInvitationStatus(friends, invitedUserIds, responses)
  return (
    <>
      <PlayerList label="Approved" users={playerLists.approved} />
      <PlayerList label="Stand By" users={playerLists.standBy} />
      <PlayerList label="Declined" users={playerLists.declined} />
      <PlayerList label="Didn't respond" users={playerLists.noResponse} />
      <PlayerList label="Not Invited" users={playerLists.notInvited} />
    </>
  )
}

export const InvitedGamePlayerLists: SFC<OwnGamePlayerListsProps> = ({ invitedUsers, responses }) => {
  const playerLists = groupInvitedGamePlayersByInvitationStatus(invitedUsers, responses)
  return (
    <>
      <PlayerList label="Approved" users={playerLists.approved} />
      <PlayerList label="Stand By" users={playerLists.standBy} />
      <PlayerList label="Declined" users={playerLists.declined} />
      <PlayerList label="Didn't respond" users={playerLists.noResponse} />
    </>
  )
}

// {
//   userId === game.hostId && <InviteToGame gameId={game.gameId} invitedPlayers={invitedPlayers} responses={responses} />
// }
