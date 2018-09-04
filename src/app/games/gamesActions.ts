import { Game, Invitation, InvitationResponse } from '../../db/types'
import { HomeGameThunkAction, HomeGameAsyncThunkAction } from '../state'
import { getUser } from '../auth/authReducer'
import { Unsubscribe } from '../../db/gamesDB'

export const SET_GAMES = 'games/set'

const setGames = (games: ReadonlyArray<Game>) => ({type: SET_GAMES as typeof SET_GAMES, games})
export type SetGames = ReturnType<typeof setGames>

export const createGame = (game: Game): HomeGameAsyncThunkAction => async (dispatch, getState, { db }) => {
  await db.createGame(game)
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