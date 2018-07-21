import * as React from 'react'
import {Component} from 'react'
import {Link} from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import {map} from 'lodash/fp'
import {Game} from '../../model/types'
import {Dispatch} from 'redux'
import {loadGames} from './gamesActions'
import {State} from '../index'
import {getGames} from './gamesReducer'
import {connect} from 'react-redux'
import {lifecycle, compose} from 'recompose'
import Button from '@material-ui/core/Button/'
import AddIcon from '@material-ui/icons/Add'

interface GamesProps {
  games: Game[]
}

export class GamesComponent extends Component<GamesProps> {
  render() {
    return (
      <div>
        <Typography variant="title" color="inherit">Games</Typography>
        <List component="nav">
          {
            map(game => (
              <ListItem>
                <ListItemText primary={game.date}/>
              </ListItem>
            ), this.props.games)
          }
        </List>
        <Link to="/games/new"><Button color="primary" variant="fab"><AddIcon/></Button></Link>
      </div>
    )
  }
}


const mapStateToProps = (state: State) => ({
  games: getGames(state)
})

interface LoadGames {
  loadGames: () => void
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadGames: () => {
    dispatch(loadGames())
  }
})

export const Games = compose(
  connect(mapStateToProps, mapDispatchToProps),
  lifecycle<LoadGames, {}>({
    componentDidMount() {
      this.props.loadGames()
    }
  })
)(GamesComponent)
