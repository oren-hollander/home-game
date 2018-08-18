import { Game, InvitationStatus, User, Address, Invitation, InvitationResponse } from '../model/types'
import { GamesDB, GamesEvent, GameEvent } from './types'
import { set, map, uniqueId, concat, without, update, forEach } from 'lodash/fp'

export const GamesTestDB: () => GamesDB = () => {

  interface GameData {
    game: Game,
    outgoingInvitations: string[]
    responses: InvitationResponse[]
    notifications: GameEvent[]
  }

  interface GamesData {
    [gameId: string]: GameData
  }

  interface UserData {
    user: User,
    addresses: Address[],
    games: GamesData,
    friends: string[]
    incomingInvitations: Invitation[]
    notifications: GamesEvent[]
  }

  interface UsersCollection {
    readonly [key: string]: UserData
  }

  let users: UsersCollection = {}

  const createUser = async (name: string, email: string) => {
    const userId = uniqueId('user-')
    const user: UserData = {
      user: {
        userId,
        name,
        email
      },
      addresses: [],
      games: {},
      friends: [],
      incomingInvitations: [],
      notifications: []
    }

    users = set(userId, user, users)
    return userId
  }
  
  const getUser = async (userId: string) => users[userId].user

  const createAddress = async (userId: string, address: Address) => {
    users = update([userId, 'addresses'], concat([address]), users)
  }
  
  const getAddresses = async (userId: string) => users[userId].addresses

  const connectFriend = async (userId: string, friendUserId: string) => {
    users = update([userId, 'friends'], concat([friendUserId]), users)
    users = update([friendUserId, 'friends'], concat([userId]), users)
  }

  const addFriend = async (userId: string, friendUserId: string) => {
    users = update([userId, 'friends'], concat([friendUserId]), users)
  }

  const removeFriend = async (userId: string, friendUserId: string) => {
    users = update([userId, 'friends'], without([friendUserId]), users)
  }

  const createGame = async (game: Game) => {
    const gameId = uniqueId('game-')
    const gameData: GameData = {
      game: set('gameId', gameId, game),
      outgoingInvitations: [],
      responses: [],
      notifications: []
    }

    users = set([game.hostId, 'games', gameId], gameData, users)
    return gameId
  }

  const inviteToGame = async (userId: string, gameId: string, playerId: string) => {
    users = set([userId, 'games', gameId, 'outgoingInvitations'], concat([playerId]), users)
    const invitation = {
      hostId: userId,
      gameId,
      playerId
    }
    users = set([playerId, 'incomingInvitations'], concat([invitation]), users)
    notifyGameSubscribers(userId, gameId)
    notifyGamesSubscribers(playerId)
  }

  const respondToGameInvitation = async (userId: string, hostId: string, gameId: string, status: InvitationStatus, notes: string) => {
    const response: InvitationResponse = {
      gameId,
      hostId,
      playerId: userId,
      status,
      notes
    }

    users = update([hostId, 'games', gameId, 'responses'], concat([response]), users)
    notifyGameSubscribers(hostId, gameId)
  }
  
  const notifyGamesSubscriber = (userId: string) => (notify: GamesEvent) => {
    notify(map(gameData => gameData.game, users[userId].games))
  }

  const notifyGamesSubscribers = (userId: string) => 
    forEach(notifyGamesSubscriber(userId), users[userId].notifications)
  
  const listenToGames = (userId: string, onGames: GamesEvent) => {
    users = set([userId, 'notifications'], concat([onGames]), users)

    Promise.resolve(onGames).then(notifyGamesSubscriber(userId))

    return () => {
      users = set([userId, 'notifications'], without([onGames]), users)
    }
  }

  const notifyGameSubscriber = (userId: string, gameId: string) => (notify: GameEvent) => {
    const game = users[userId].games[gameId].game
    const invitations = map(playerId => ({ hostId: userId, gameId, playerId }), users[userId].games[gameId].outgoingInvitations)
    const responses = users[userId].games[gameId].responses
    notify(game, invitations, responses)
  }

  const notifyGameSubscribers = (userId: string, gameId: string) => 
    forEach(notifyGameSubscriber(userId, gameId), users[userId].games[gameId].notifications)

  const listenToGame = (userId: string, gameId: string, onGame: GameEvent) => {
    users = set([userId, 'games', gameId, 'notifications'], concat([onGame]), users)
    
    Promise.resolve(onGame).then(notifyGameSubscriber(userId, gameId))

    return () => { 
      users = set([userId, 'games', gameId, 'notifications'], without([onGame]), users)
    }
  }

  return {
    createUser,
    getUser,
    createAddress,
    getAddresses,
    connectFriend,
    addFriend,
    removeFriend,
    createGame,
    inviteToGame,
    respondToGameInvitation,
    listenToGames,
    listenToGame
  }
}