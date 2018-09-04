import * as React from 'react'
import {Component} from 'react'
import {Link} from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import {map} from 'lodash/fp'
import {Game} from '../../db/types'
import {listenToGames, unlistenToGames} from './gamesActions'
import {getGames} from './gamesReducer'
import Button from '@material-ui/core/Button/'
import AddIcon from '@material-ui/icons/Add'
import { listen } from '../../data/listen'
import { Date } from '../../ui/Date'

interface GamesProps {
  data: Game[]
}

export class GamesComponent extends Component<GamesProps> {
  render() {
    return (
      <div>
        <Typography variant="title" color="inherit">Games</Typography>
        <List component="nav">
          {
            map(game => (
              <ListItem key={game.gameId}>
                <Date day={game.timestamp.toDate().getDay()} month={game.timestamp.toDate().getMonth()} year={game.timestamp.toDate().getFullYear()}/>
                {game.gameId}
              </ListItem>
            ), this.props.data)
          }
        </List>
        <Link to="/games/new"><Button color="primary" variant="fab"><AddIcon/></Button></Link>
      </div>
    )
  }
}

export const Games = listen(listenToGames(), unlistenToGames(), getGames)(GamesComponent)