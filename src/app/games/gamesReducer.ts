import { Game, InvitationResponse, User } from '../../db/types'
import { GamesAction, SET_GAMES, SET_GAME, CLEAR_GAME } from './gamesActions'
import { State } from '../state'
import { Selector } from 'reselect'
import { set, unset } from 'lodash/fp'

export interface GameState {
  readonly game: Game
  readonly invitedPlayers: ReadonlyArray<User>
  readonly responses: ReadonlyArray<InvitationResponse>
}

export interface GamesState {
  readonly games: ReadonlyArray<Game>
  readonly game?: GameState 
}

const initialGamesState: GamesState = {
  games: []
}

export const gamesReducer = (games: GamesState = initialGamesState, action: GamesAction): GamesState => {
  switch (action.type) {
    case SET_GAMES:
      return set('games', action.games, games)
    case SET_GAME:
      return set('game', {
        game: action.game, 
        invitedPlayers: action.invitedPlayers,
        responses: action.responses
      }, games)
    case CLEAR_GAME:
      return unset('game', games)
    default:
      return games
  }
}

export const getGames: Selector<State, ReadonlyArray<Game>> = (state: State) => state.games.games
export const getGame: Selector<State, GameState> = (state: State) => state.games.game!