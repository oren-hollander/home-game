import * as firebase from 'firebase/app'

type Timestamp = firebase.firestore.Timestamp

export interface Stakes { 
  readonly smallBlind: number
  readonly bigBlind: number
}

export type InvitationStatus = 'approved' | 'declined' | 'standBy'

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

export interface Game {
  readonly gameId: string
  readonly hostId: string
  readonly hostName: string,
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