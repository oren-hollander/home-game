import { Game, Invitation, InvitationResponse, Address } from '../../db/types'
import { HomeGameAsyncThunkAction } from '../state'
import { getSignedInUser } from '../auth/authReducer'
import * as firebase from 'firebase'
import { showStatus, SuccessStatus } from '../status/statusActions'
import { push } from 'connected-react-router'
import { map } from 'lodash/fp'
import { GameAndInvitation } from './gamesReducer'
import { Dictionary } from 'lodash'

export const SET_GAMES = 'games/set-games'

export const setGames = (games: Dictionary<GameAndInvitation>) => ({ type: SET_GAMES as typeof SET_GAMES, games })
export type SetGames = ReturnType<typeof setGames>

export const createGame = (
  timestamp: firebase.firestore.Timestamp,
  address: Address,
  description: string
): HomeGameAsyncThunkAction => async (dispatch, getState, { db }) => {
  const user = getSignedInUser(getState())

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

export type GamesAction = SetGames
