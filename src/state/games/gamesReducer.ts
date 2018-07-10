import {Game} from '../../model/types'
import {GamesAction} from './gamesActions'

export type GamesState = Game[]

export const gamesReducer = (games: GamesState = [], action: GamesAction): GamesState => {
  return games
}