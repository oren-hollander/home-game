export enum GameType {
  NLH = 'NLH',
  PLO = 'PLO'
}

type UserId = string

export interface Stakes { 
  readonly smallBlind: number
  readonly bigBlind: number
}

export const Stakes = (smallBlind: number, bigBlind: number) => ({ smallBlind, bigBlind })

export enum InvitationStatus {
  Approved = 'approved', 
  Declined = 'declined', 
  NoResponse = 'no-response',
  WaitingList = 'waiting-list'
}

export interface Invitation {
  readonly player: UserId
  readonly status: InvitationStatus
  readonly notes: string
}

export const Invitation = (player: UserId, status: InvitationStatus, notes: string = ''): Invitation =>
  ({ player, status, notes })

export interface Game {
  readonly id: string
  readonly type: GameType
  readonly stakes: Stakes
  readonly maxPlayers: number
}

export const Game = (id: string, type: GameType, stakes: Stakes, maxPlayers: number): Game => ({
  id, type, stakes, maxPlayers
})

export interface Address {
  readonly houseNumber: string
  readonly street: string
  readonly city: string
  readonly notes?: string
}

export interface User {
  readonly uid: UserId
  readonly name: string
  readonly address?: Address
}

export const User = (email: string, name: string, address?: Address): User => ({uid: email, name, address})

export interface HomeGameInvitation {
  readonly userId: UserId
  readonly email: string
}

export const HomeGameInvitation = (userId: string, email: string): HomeGameInvitation => ({userId, email})
