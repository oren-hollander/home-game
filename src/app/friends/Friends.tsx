import * as React from 'react'
import { SFC } from 'react'
import { User } from '../../db/types'
import { Link } from 'react-router-dom'
import { map, noop } from 'lodash/fp'
import { ListGroup, ListGroupItem } from 'reactstrap'
import { loadFriends } from './friendsActions'
import { getFriends } from './friendsReducer'
import { Page } from '../../ui/Page'
import { CompProps, dataLoader } from '../../data/dataLoader'
import { Loading } from '../../ui/Loading'
import { markStale, markFresh } from '../dataStatus/dataStatusActions'
import { getDataStatus } from '../dataStatus/dataStatusReducer'
import { compose, mapProps } from 'recompose'

interface FriendsProps {
  friends: ReadonlyArray<User>
  fresh: boolean
}

namespace UI {
  export const Friends: SFC<FriendsProps> = ({ friends, fresh }) => (
    <Page>
      <Loading fresh={fresh} />
      <ListGroup>
        {map(
          friend => (
            <ListGroupItem key={friend.userId}>{friend.name}</ListGroupItem>
          ),
          friends
        )}
        <ListGroupItem color="primary">
          <Link to="/friends/invite">Invite a new friend</Link>
        </ListGroupItem>
      </ListGroup>
    </Page>
  )
}

const mapFriendsProps = mapProps<FriendsProps, CompProps<ReadonlyArray<User>>>(({ data, dataStatus }) => ({
  friends: data,
  fresh: dataStatus === 'fresh'
}))

export const Friends = compose(
  dataLoader(noop, loadFriends, markStale('friends'), markFresh('friends'), getFriends, getDataStatus('friends')),
  mapFriendsProps
)(UI.Friends)
