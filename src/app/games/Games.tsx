import * as React from 'react'
import { SFC, ComponentType } from 'react'
import { Link } from 'react-router-dom'
import { map, values } from 'lodash/fp'
import { DateView } from '../../ui/DateView'
import { ListGroup, ListGroupItem } from 'reactstrap'
import { Page } from '../../ui/Page'
import { Dictionary } from 'lodash'
import { GameAndInvitation, getGames } from './gamesReducer'
import { connect } from 'react-redux'
import { State } from '../state';

namespace UI {
  export interface GamesProps {
    games: Dictionary<GameAndInvitation>
  }

  export const Games: SFC<GamesProps> = ({ games }) => (
    <Page>
      <ListGroup>
        {map(
          game => (
            <ListGroupItem key={game.gameId}>
              <Link to={`/games/${game.hostId}/${game.gameId}`}>
                {game.hostName}, <DateView timestamp={game.timestamp} />
              </Link>
            </ListGroupItem>
          ),
          map(game => game.game, values(games))
        )}
        <ListGroupItem color="primary" key="new">
          <Link to="/games/new">Create new game</Link>
        </ListGroupItem>
      </ListGroup>
    </Page>
  )
}

const mapStateToProps = (state: State): UI.GamesProps => ({
  games: getGames(state)
})

export const Games: ComponentType = connect<UI.GamesProps, {}, {}, State>(mapStateToProps)(UI.Games)