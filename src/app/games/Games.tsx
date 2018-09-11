import * as React from 'react'
import { Component } from 'react'
import { Link } from 'react-router-dom'
import { map } from 'lodash/fp'
import { Game } from '../../db/types'
import { listenToGames } from './gamesActions'
import { getGames } from './gamesReducer'
import { listen } from '../../data/listen'
import { DateView } from '../../ui/DateView'
import { compose } from 'recompose'
import { State } from '../state';
import { connect } from 'react-redux';
import { ListGroup, ListGroupItem } from 'reactstrap'
import { Page } from '../../ui/Page'

interface GamesProps {
  games: ReadonlyArray<Game>
}

namespace UI {
  export class Games extends Component<GamesProps> {
    render() {
      return (
        <Page>
          <ListGroup>
            {
              map(game => (
                <ListGroupItem key={game.gameId}>
                  <Link to={`/games/${game.hostId}/${game.gameId}`}>
                    {game.hostName}, <DateView timestamp={game.timestamp} />
                  </Link>
                </ListGroupItem>
              ), this.props.games)
            }
            <ListGroupItem color="primary" key="new">
              <Link to="/games/new">Create new game</Link>
            </ListGroupItem>
          </ListGroup>
        </Page>
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