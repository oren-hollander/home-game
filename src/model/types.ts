export type GameType = 'NLH' | 'PLO'

export interface Stakes { 
  readonly smallBlind: number
  readonly bigBlind: number
}

export type InvitationStatus = Time | 'approved' | 'declined'

export interface InvitationResponse {
  readonly hostId: string
  readonly gameId: string
  readonly playerId: string
  readonly status: InvitationStatus
  readonly arriveTime: Time
}

export interface Invitation {
  readonly hostId: string
  readonly gameId: string
  readonly playerId: string
}

export interface Date {
  readonly year: number
  readonly month: number
  readonly day: number
}

export interface Time {
  readonly hour: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23
  readonly minute: 0 | 15 | 30 | 45
}

export interface Game {
  readonly hostId: string
  readonly gameId: string
  readonly type: GameType
  readonly stakes: Stakes
  readonly maxPlayers: number
  readonly date: Date
  readonly time: Time
  readonly address: Address
  readonly notes?: string
}

export interface Address {
  readonly houseNumber: string
  readonly street: string
  readonly city: string
  readonly notes?: string
}

export interface User {
  readonly userId: string
  readonly email: string
  readonly name: string
  readonly address?: Address
}