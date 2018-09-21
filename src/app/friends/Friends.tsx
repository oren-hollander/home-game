import * as React from 'react'
import { SFC } from 'react'
import { User } from '../../db/types'
import { Link } from 'react-router-dom'
import { map } from 'lodash/fp'
import { ListGroup, ListGroupItem } from 'reactstrap'
import { Page } from '../../ui/Page'

interface FriendsProps {
  friends: ReadonlyArray<User>
}

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