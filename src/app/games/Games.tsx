import * as React from 'react'
import { Component } from 'react'
import { Link } from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import { map } from 'lodash/fp'
import { Game } from '../../db/types'
import { listenToGames } from './gamesActions'
import { getGames } from './gamesReducer'
import Button from '@material-ui/core/Button/'
import AddIcon from '@material-ui/icons/Add'
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
          <Typography variant="title" color="inherit">Games</Typography>
          <List component="nav">
            {
              map(game => (
                <ListItem key={game.gameId}>
                  <Date day={game.timestamp.toDate().getDay()} month={game.timestamp.toDate().getMonth()} year={game.timestamp.toDate().getFullYear()} />
                  {game.gameId}
                </ListItem>
              ), this.props.games)
            }
          </List>
          <Link to="/games/new"><Button color="primary" variant="fab"><AddIcon /></Button></Link>
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