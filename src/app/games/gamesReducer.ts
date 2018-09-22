import { Game, InvitationResponse, User } from '../../db/types'
import { GamesAction, SET_GAMES } from './gamesActions'
import { State } from '../state'
import { Selector, ParametricSelector } from 'reselect'
import { Dictionary } from 'lodash'

export interface GameAndInvitation {
  game: Game
  invitedPlayers: ReadonlyArray<User>
  invitationResponses: ReadonlyArray<InvitationResponse>
}

export type GamesState = Dictionary<GameAndInvitation>

export const gamesReducer = (
  games: Dictionary<GameAndInvitation> = {},
  action: GamesAction
): Dictionary<GameAndInvitation> => {
  switch (action.type) {
    case SET_GAMES:
      return action.games
    default:
      return games
  }
}

export const getGames: Selector<State, Dictionary<GameAndInvitation>> = state => state.games
export const getGame: ParametricSelector<State, string, GameAndInvitation> = (state, gameId) => state.games[gameId]
