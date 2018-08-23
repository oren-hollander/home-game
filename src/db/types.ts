import { Game, Invitation, InvitationResponse, User, Address } from '../model/types'

export interface GamesEvent {
  (games: ReadonlyArray<Game>): void
}

export interface GameEvent {
  (game: Game, invitations: ReadonlyArray<Invitation>, responses: ReadonlyArray<InvitationResponse>): void
}

export type Unsubscribe = () => void

export interface GamesDB {
  createUser(user: User): Promise<void>
  getUser(userId: string): Promise<User | undefined>

  createAddress(userId: string, address: Address): Promise<void>
  getAddresses(userId: string): Promise<ReadonlyArray<Address>>

  createFriendInvitation(userId: string): Promise<string>
  acceptFriendInvitation(userId: string, invitationId: string, friendUserId: string): Promise<void>

  addFriend(userId: string, friendUserId: string): Promise<void>
  removeFriend(userId: string, friendUserId: string): Promise<void>
  getFriends(userId: string): Promise<User[]>

  createGame(game: Game): Promise<Game>
  updateGame(game: Game, validateInvitations: boolean): Promise<void> 

  inviteToGame(playerId: string, invitation: Invitation): Promise<void>
  respondToGameInvitation(response: InvitationResponse): Promise<void>
  
  listenToGames(userId: string, onGames: GamesEvent): Unsubscribe

  listenToGame(userId: string, gameId: string, onGame: GameEvent): Unsubscribe
}

