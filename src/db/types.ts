import * as firebase from 'firebase/app'

type Timestamp = firebase.firestore.Timestamp

export interface Stakes { 
  readonly smallBlind: number
  readonly bigBlind: number
}

export type InvitationStatus = 'approved' | 'declined' | 'stand-by'

export interface InvitationResponse {
  readonly hostId: string
  readonly gameId: string
  readonly playerId: string
  readonly valid: boolean
  readonly status: InvitationStatus
  readonly timestamp: Timestamp
  readonly notes?: string
}

export interface Invitation {
  readonly hostId: string
  readonly gameId: string
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
  readonly gameId: string
  readonly hostId: string
  readonly address: Address
  readonly timestamp: Timestamp
  readonly description: string
}

export interface Address {
  readonly addressId: string
  readonly label: string
  readonly houseNumber: string
  readonly street: string
  readonly city: string
  readonly notes?: string
}

export interface User {
  readonly userId: string
  readonly name: string
} 