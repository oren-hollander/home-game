import * as React from 'react'
import { SFC } from 'react'
import { User } from '../../db/types'
import { Link } from 'react-router-dom'
import { map } from 'lodash/fp'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { load } from '../../data/load'
import { State } from '../state'
import { ListGroup, ListGroupItem } from 'reactstrap'
import { loadFriends } from './friendsActions'
import { getFriends } from './friendsReducer'
import { Page } from '../../ui/Page'

interface FriendsProps {
  friends: ReadonlyArray<User>
}

namespace UI {
  export const Friends: SFC<FriendsProps> = ({ friends }) => (
    <Page>
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

const mapStateToProps = (state: State): FriendsProps => ({
  friends: getFriends(state)
})

export const Friends = compose(
  load(loadFriends),
  connect(mapStateToProps)
)(UI.Friends)
