import {Id} from './firebaseUtils'

export enum GameType {
  NLH = 'NLH',
  PLO = 'PLO'
}

export interface Stakes { 
  readonly smallBlind: number
  readonly bigBlind: number
}

export const Stakes = (smallBlind: number, bigBlind: number) => ({ smallBlind, bigBlind })

export enum InvitationStaus {
  Approved = 'approved', 
  Declined = 'declined', 
  NoResponse = 'no-response',
  WaitingList = 'waiting-list'
}

export interface Invitation {
  readonly status: InvitationStaus
  readonly notes: string
}

export const Invitation = (playerId: string, status: InvitationStaus, notes: string = ''): Invitation & Id =>
  ({ id: playerId, status, notes })

export interface Game {
  readonly hostId: string
  readonly type: GameType
  readonly stakes: Stakes
  readonly maxPlayers: number
}

export const Game = (hostId: string, type: GameType, stakes: Stakes, maxPlayers: number) => ({
  hostId, type, stakes, maxPlayers
})

export interface Player extends Id {
  readonly name: string
}

export const Player = (id: string, name: string) => ({id, name})

export interface Address {
  readonly houseNumber: string
  readonly street: string
  readonly city: string
  readonly notes?: string
}

export interface Host extends Player {
  readonly address: Address
}