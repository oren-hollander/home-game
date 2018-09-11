import { groupHostedGamePlayersByInvitationStatus, groupInvitedGamePlayersByInvitationStatus, HostedGamePlayerLists, InvitedGamePlayerLists } from './PlayerLists'
import { User, InvitationStatus, InvitationResponse } from '../../db/types'
import { Timestamp } from '../../types'
import { map } from 'lodash/fp'

describe('player lists', () => {
  describe('hosted game player lists', () => {
    const Approved1 = 'A1'
    const Approved2 = 'A2'
    const Declined1 = 'D1'
    const Declined2 = 'D2'
    const StandBy1 = 'SB1'
    const StandBy2 = 'SB2'
    const NoResponse1 = 'NR1'
    const NoResponse2 = 'NR2'
    const NotInvited1 = 'NI1'
    const NotInvited2 = 'NI2'

    const playerIds = [
      Approved1,
      Approved2,
      Declined1,
      Declined2,
      StandBy1,
      StandBy2,
      NoResponse1,
      NoResponse2,
      NotInvited1,
      NotInvited2
    ]

    const InvitationResponse = (playerId: string, status: InvitationStatus): InvitationResponse => ({
      gameId: 'game-1',
      hostId: 'host',
      playerId,
      status,
      valid: true,
      timestamp: Timestamp.now()
    })

    let playerLists: HostedGamePlayerLists

    const Player = (id: string): User => ({
      userId: id,
      name: `name-of-${id}`,
    })

    beforeEach(() => {
      const players = map(Player, playerIds)

      playerLists = groupHostedGamePlayersByInvitationStatus(
        players,
        [
          Approved1, Approved2, Declined1, Declined2, StandBy1, StandBy2, NoResponse1, NoResponse2
        ],
        [
          InvitationResponse(Approved1, 'approved'),
          InvitationResponse(Approved2, 'approved'),
          InvitationResponse(Declined1, 'declined'),
          InvitationResponse(Declined2, 'declined'),
          InvitationResponse(StandBy1, 'standBy'),
          InvitationResponse(StandBy2, 'standBy'),
        ]
      )
    })

    test('should get the approved players', () => {
      expect(playerLists.approved).toEqual([Player(Approved1), Player(Approved2)])
    })

    test('should get the declined players', () => {
      expect(playerLists.declined).toEqual([Player(Declined1), Player(Declined2)])
    })

    test('should get the standBy players', () => {
      expect(playerLists.standBy).toEqual([Player(StandBy1), Player(StandBy2)])
    })

    test('should get the players who did not respond', () => {
      expect(playerLists.noResponse).toEqual([Player(NoResponse1), Player(NoResponse2)])
    })

    test('should get the players who were not invited', () => {
      expect(playerLists.notInvited).toEqual([Player(NotInvited1), Player(NotInvited2)])
    })
  })

  describe('invited game player lists', () => {
    const Approved1 = 'A1'
    const Approved2 = 'A2'
    const Declined1 = 'D1'
    const Declined2 = 'D2'
    const StandBy1 = 'SB1'
    const StandBy2 = 'SB2'
    const NoResponse1 = 'NR1'
    const NoResponse2 = 'NR2'
    
    const playerIds = [
      Approved1,
      Approved2,
      Declined1,
      Declined2,
      StandBy1,
      StandBy2,
      NoResponse1,
      NoResponse2
    ]

    const InvitationResponse = (playerId: string, status: InvitationStatus): InvitationResponse => ({
      gameId: 'game-1',
      hostId: 'host',
      playerId,
      status,
      valid: true,
      timestamp: Timestamp.now()
    })

    let playerLists: InvitedGamePlayerLists

    const Player = (id: string): User => ({
      userId: id,
      name: `name-of${id}`
    })

    beforeEach(() => {
      const players = map(Player, playerIds)

      playerLists = groupInvitedGamePlayersByInvitationStatus(
        players,
        [
          InvitationResponse(Approved1, 'approved'),
          InvitationResponse(Approved2, 'approved'),
          InvitationResponse(Declined1, 'declined'),
          InvitationResponse(Declined2, 'declined'),
          InvitationResponse(StandBy1, 'standBy'),
          InvitationResponse(StandBy2, 'standBy'),
        ]
      )
    })

    test('should get the approved players', () => {
      expect(playerLists.approved).toEqual([Player(Approved1), Player(Approved2)])
    })

    test('should get the declined players', () => {
      expect(playerLists.declined).toEqual([Player(Declined1), Player(Declined2)])
    })

    test('should get the standBy players', () => {
      expect(playerLists.standBy).toEqual([Player(StandBy1), Player(StandBy2)])
    })

    test('should get the players who did not respond', () => {
      expect(playerLists.noResponse).toEqual([Player(NoResponse1), Player(NoResponse2)])
    })
  })
})
