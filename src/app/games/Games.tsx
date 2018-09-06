import * as React from 'react'
import { Component } from 'react'
import { Link } from 'react-router-dom'
import { map } from 'lodash/fp'
import { Game } from '../../db/types'
import { listenToGames } from './gamesActions'
import { getGames } from './gamesReducer'
import { listen } from '../../data/listen'
import { Date } from '../../ui/Date'
import { compose } from 'recompose'
import { State } from '../state';
import { connect } from 'react-redux';

interface GamesProps {
  games: ReadonlyArray<Game>
}

namespace UI {
  export class Games extends Component<GamesProps> {
    render() {
      return (
        <div>
          Games
          <div>
            {
              map(game => (
                <div key={game.gameId}>
                  <Date day={game.timestamp.toDate().getDay()} month={game.timestamp.toDate().getMonth()} year={game.timestamp.toDate().getFullYear()} />
                  {game.gameId}
                </div>
              ), this.props.games)
            }
          </div>
          <Link to="/games/new"><button>New</button></Link>
        </div>
      )
    }
  }
}

const mapStateToProps = (state: State): GamesProps => ({
  games: getGames(state)
})

export const Games = compose(
  listen(listenToGames),
  connect(mapStateToProps)
)(UI.Games)