import { Game, Invitation, InvitationResponse, Address, User } from '../../db/types'
import { HomeGameAsyncThunkAction } from '../state'
import { getUser } from '../auth/authReducer'
import * as firebase from 'firebase'
import { showStatus, SuccessStatus } from '../status/statusActions'
import { push } from 'connected-react-router'
import { map } from 'lodash/fp'

export const SET_GAMES = 'games/set-games'
export const SET_GAME = 'games/set-game'
export const CLEAR_GAME = 'games/clear-game'

const setGames = (games: ReadonlyArray<Game>) => ({ type: SET_GAMES as typeof SET_GAMES, games })
export type SetGames = ReturnType<typeof setGames>

const setGame = (game: Game, invitedPlayers: ReadonlyArray<User>, responses: ReadonlyArray<InvitationResponse>) => ({
  type: SET_GAME as typeof SET_GAME,
  game,
  invitedPlayers,
  responses
})
export type SetGame = ReturnType<typeof setGame>

const clearGame = (gameId: string) => ({ type: CLEAR_GAME as typeof CLEAR_GAME, gameId })
export type ClearGame = ReturnType<typeof clearGame>

export const createGame = (
  timestamp: firebase.firestore.Timestamp,
  address: Address,
  description: string
): HomeGameAsyncThunkAction => async (dispatch, getState, { db }) => {
  const user = getUser(getState())

  const game: Game = {
    gameId: '',
    hostId: user.userId,
    hostName: user.name,
    timestamp,
    address,
    description
  }

  await db.createGame(game)
  dispatch(showStatus(SuccessStatus('Game created')))
  dispatch(push('/games'))
}

export const invitePlayers = (
  invitation: Invitation,
  playerIds: ReadonlyArray<string>
): HomeGameAsyncThunkAction => async (_dispatch, _getState, { db }) => {
  await Promise.all(map(playerId => db.inviteToGame(playerId, invitation), playerIds))
}

export const respondToInvitation = (response: InvitationResponse): HomeGameAsyncThunkAction => async (
  _dispatch,
  _getState,
  { db }
) => {
  await db.respondToGameInvitation(response)
}

// export const listenToGames = (): HomeGameAsyncThunkAction<Unsubscribe> => async (dispatch, getState, { db }) =>
//   new Promise<Unsubscribe>(resolve => {
//     const userId = getUser(getState()).userId
//     // const unsubscribe = db.listenToGames(userId, games => {
//     //   dispatch(setGames(games))
//     //   resolve(unsubscribe)
//     // })
//   })

// export const listenToGame = (hostId: string, gameId: string): HomeGameAsyncThunkAction<Unsubscribe> => async (dispatch, _getState, { db }) =>
//   new Promise<Unsubscribe>(resolve => {
//     const unsubscribe = db.listenToGame(hostId, gameId, (game, invitatedPlayers, responses) => {
//       dispatch(setGame(game, invitatedPlayers, responses))
//       resolve(unsubscribe)
//     })
//   })

export interface GameId {
  hostId: string
  gameId: string
}

// export const listenToGameAndFriends = (gameId: GameId): HomeGameAsyncThunkAction<Unsubscribe> => async dispatch => {
//   const unsubscribeGame = dispatch(listenToGame(gameId.hostId, gameId.gameId))
//   const unsubscribeFriends = dispatch(loadFriends())
  
//   const unsubscribes = await Promise.all([unsubscribeGame, unsubscribeFriends])
  
//   return () => {
//     forEach(unsubscribe => unsubscribe(), unsubscribes)
//   }
// }

export type GamesAction = SetGames | SetGame | ClearGame
