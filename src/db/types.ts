import { Game, Invitation, InvitationResponse, InvitationStatus, User, Address } from '../model/types'

export interface GamesEvent {
  (games: ReadonlyArray<Game>): void
}

export interface GameEvent {
  (game: Game, invitations: ReadonlyArray<Invitation>, responses: ReadonlyArray<InvitationResponse>): void
}

export type Unsubscribe = () => void

export interface GamesDB {
  createUser(name: string, email: string): Promise<string>
  getUser(userId: string): Promise<User>

  createAddress(userId: string, address: Address): Promise<void>
  getAddresses(userId: string): Promise<ReadonlyArray<Address>>

  connectFriend(userId: string, friendUserId: string): Promise<void>
  addFriend(userId: string, friendUserId: string): Promise<void>
  removeFriend(userId: string, friendUserId: string): Promise<void>

  createGame(game: Game): Promise<string>
  
  inviteToGame(userId: string, gameId: string, playerId: string): Promise<void>
  respondToGameInvitation(userId: string, hostId: string, gameId: string, status: InvitationStatus, notes: string): Promise<void>
  
  listenToGames(userId: string, onGames: GamesEvent): Unsubscribe

  listenToGame(userId: string, gameId: string, onGame: GameEvent): Unsubscribe
}

