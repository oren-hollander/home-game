import * as React from 'react'
import { SFC } from 'react'
import { User } from '../../db/types'
import { Status } from '../status/Status'
import { Toolbar } from '../../ui/Toolbar'
import { Link } from 'react-router-dom'
import { map } from 'lodash/fp'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { load } from '../../data/load'
import { State } from '../state'
import {
  ListGroup, ListGroupItem,
  Container, Row, Col
} from 'reactstrap'

interface FriendsProps {
  friends: ReadonlyArray<User>
}
import { loadFriends } from './friendsActions'
import { getFriends } from './friendsReducer'

namespace UI {
  export const Friends: SFC<FriendsProps> = ({ friends }) =>
    <>
      <Toolbar path={[{ title: 'Home', path: '/' }]} />
      <Container style={{ paddingTop: '16px' }}>
        <Row>
          <Col>
            <ListGroup>
              {
                map(friend => (
                  <ListGroupItem key={friend.userId}>
                    {friend.name}
                  </ListGroupItem>
                ), friends)
              }
              <ListGroupItem color="primary">
                <Link to="/friends/invite">Invite a new friend</Link>
              </ListGroupItem>
            </ListGroup>
          </Col>
        </Row>
        <Row>
          <Col>
            <Status />
          </Col>
        </Row>
      </Container >
    </>
}

const mapStateToProps = (state: State): FriendsProps => ({
  friends: getFriends(state)
})

export const Friends = compose(
  load(loadFriends),
  connect(mapStateToProps)
)(UI.Friends)
