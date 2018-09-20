import * as React from 'react'
import { SFC } from 'react'
import { Link } from 'react-router-dom'
import { map, noop } from 'lodash/fp'
import { Game } from '../../db/types'
import { listenToGames } from './gamesActions'
import { getGames } from './gamesReducer'
import { DateView } from '../../ui/DateView'
import { ListGroup, ListGroupItem } from 'reactstrap'
import { Page } from '../../ui/Page'
import { CompProps, dataLoader } from '../../data/dataLoader'
import { Loading } from '../../ui/Loading'
import { getDataStatus } from '../dataStatus/dataStatusReducer'
import { markStale, markFresh } from '../dataStatus/dataStatusActions'
import { compose, mapProps } from 'recompose'

interface GamesProps {
  games: ReadonlyArray<Game>
  fresh: boolean
}

namespace UI {
  export const Games: SFC<GamesProps> = ({ games, fresh }) => (
    <Page>
      <Loading fresh={fresh} />
      <ListGroup>
        {map(
          game => (
            <ListGroupItem key={game.gameId}>
              <Link to={`/games/${game.hostId}/${game.gameId}`}>
                {game.hostName}, <DateView timestamp={game.timestamp} />
              </Link>
            </ListGroupItem>
          ),
          games
        )}
        <ListGroupItem color="primary" key="new">
          <Link to="/games/new">Create new game</Link>
        </ListGroupItem>
      </ListGroup>
    </Page>
  )
}

const mapGamesProps = mapProps<GamesProps, CompProps<ReadonlyArray<Game>>>(({ data, dataStatus }) => ({
  games: data,
  fresh: dataStatus === 'fresh'
}))

export const Games = compose(
  dataLoader(noop, listenToGames, markStale('games'), markFresh('games'), getGames, getDataStatus('games')),
  mapGamesProps
)(UI.Games)
