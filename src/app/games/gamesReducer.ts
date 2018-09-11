import { Game, InvitationResponse, User } from '../../db/types'
import { GamesAction, SET_GAMES, SET_GAME, CLEAR_GAME } from './gamesActions'
import { State } from '../state'
import { Selector, ParametricSelector } from 'reselect'
import { set, values, unset, map, fromPairs, get } from 'lodash/fp'
import { Dictionary } from 'lodash'

export interface GameState {
  readonly game: Game
  readonly invitedPlayers: ReadonlyArray<User>
  readonly responses: ReadonlyArray<InvitationResponse>
}

export type GamesState = Dictionary<GameState>

export const gamesReducer = (games: GamesState = {}, action: GamesAction): GamesState => {
  switch (action.type) {
    case SET_GAMES: {
      return fromPairs(map(game => {
        const gameState: GameState = {
          game,
          invitedPlayers: [],
          responses: []
        }
        return [game.gameId, gameState]
      }, action.games))
    }
    case SET_GAME: {
      const gameState: GameState = {
        game: action.game,
        invitedPlayers: action.invitedPlayers,
        responses: action.responses
      }
      return set(action.game.gameId, gameState, games) as GamesState
    }
    case CLEAR_GAME:
      return unset(action.gameId, games)
    default:
      return games
  }
}

export const getGames: Selector<State, ReadonlyArray<Game>> = state => map(gs => gs.game, values(state.games)) 

export const getGame: ParametricSelector<State, { gameId: string }, GameState | undefined> = (state, { gameId }) => get(gameId, state)