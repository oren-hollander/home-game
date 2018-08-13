import { Game } from '../../model/types'
import { GamesAction, SET_GAMES } from './gamesActions'
import { State } from '../index'
import { Selector } from 'reselect'

export type GamesState = Game[]

export const gamesReducer = (games: GamesState = [], action: GamesAction): GamesState => {
  switch (action.type) {
    case SET_GAMES:
      return action.games
    default:
      return games
  }
}

export const getGames: Selector<State, Game[]> = (state: State) => state.games