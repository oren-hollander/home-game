import { Game, Invitation, InvitationResponse, Address } from '../../db/types'
import { HomeGameThunkAction, HomeGameAsyncThunkAction } from '../state'
import { getUser } from '../auth/authReducer'
import { Unsubscribe } from '../../db/gamesDB'
import * as firebase from 'firebase'
import { showStatus, SuccessStatus } from '../status/statusActions';
import { push } from 'connected-react-router'

export const SET_GAMES = 'games/set'

const setGames = (games: ReadonlyArray<Game>) => ({type: SET_GAMES as typeof SET_GAMES, games})
export type SetGames = ReturnType<typeof setGames>

export const createGame = (timestamp: firebase.firestore.Timestamp, address: Address, description: string): HomeGameAsyncThunkAction => async (dispatch, getState, { db }) => {
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

export const invitePlayer = (invitation: Invitation, playerId: string): HomeGameAsyncThunkAction => async (dispatch, getState, { db }) => {
  await db.inviteToGame(playerId, invitation)
}

export const respondToInvitation = (response: InvitationResponse): HomeGameAsyncThunkAction => async (dispatch, getState, { db }) => {
  await db.respondToGameInvitation(response)
}

export const listenToGames = (): HomeGameThunkAction<Unsubscribe> => (dispatch, getState, { db }): Unsubscribe => {
  const userId = getUser(getState()).userId
  return db.listenToGames(userId, games => {
    dispatch(setGames(games))
  })
}

export type GamesAction = SetGames