export enum GameType {
  NLH = 'NLH',
  PLO = 'PLO'
}

export interface Stakes {
  readonly smallBlind: number
  readonly bigBlind: number
}

export interface Game {
  readonly id: string
  readonly host: string
  readonly type: GameType
  readonly stakes: Stakes
  readonly maxPlayers: number
  readonly notes: string
}

export interface Invitation {
  readonly id: string
  readonly gameId: string
  readonly playerId: string
}

export enum InvitationStatus {
  Approved = 'approved',
  Declined = 'declined',
  WaitingList = 'waiting-list'
}

export interface ArriveTime {
  hour: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  minute: 0 | 15 | 30 | 45
}

export interface InvitationResponse {
  readonly gameId: string
  readonly hostId: string
  readonly playerId: string
  readonly status: InvitationStatus
  readonly time?: ArriveTime
}