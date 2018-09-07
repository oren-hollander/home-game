import * as React from 'react'
import { Component } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { connect } from 'react-redux'
import { acceptFriendInvitation } from './friendsActions'
import { HomeGameThunkDispatch } from '../state'
import { parse } from 'query-string'
import { Alert } from 'reactstrap'
import { delay } from '../../util/delay'
import { Toolbar } from '../../ui/Toolbar'
import { Status } from '../status/Status'
import {
  Jumbotron,
  Container, Row, Col
} from 'reactstrap'

interface AcceptFriendInvitationProps  {
  acceptFriendInvitation: (playerId: string, invitationId: string) => void
}

namespace UI {
  interface AcceptFriendInvitationState {
    loaded: boolean
    valid: boolean
  }

  export class AcceptFriendInvitation extends Component<RouteComponentProps<{}> & AcceptFriendInvitationProps, AcceptFriendInvitationState> {
    state: AcceptFriendInvitationState = { 
      loaded: false,
      valid: false
    }

    async componentDidMount() {
      await delay(2000)
      const { userId, invitationId } = parse(this.props.location.search)
      if (userId && invitationId) {
        await this.props.acceptFriendInvitation(userId, invitationId)
        this.setState({ loaded: true, valid: true })
      }
      else { 
        this.setState({ loaded: true, valid: false })
      }
    }

    private ConnectFriendStatus = () => {
      if (this.state.loaded) {
        return this.state.valid
          ?
          <Alert color="success">Friend connected</Alert>
          :
          <Alert color="warning">Invalid invitation</Alert>
      }

      return null
    }

    render() {
        return (
        <>
        <Toolbar path={[{ title: 'Home', path: '/' }, { title: 'Friends', path: '/friends' }]} />
        <Container style={{ paddingTop: '16px' }}>
          <Row>
            <Col>
              <Jumbotron>
                Connecting friend
                <this.ConnectFriendStatus/>
              </Jumbotron>
            </Col>
          </Row>
          <Row>
            <Col>
              <Status />
            </Col>
          </Row>
        </Container>
      </>
    )
    }
  }
}

const mapDispatchToProps = (dispatch: HomeGameThunkDispatch): AcceptFriendInvitationProps => ({
  acceptFriendInvitation: (playerId: string, invitationId: string) => {
    dispatch(acceptFriendInvitation(playerId, invitationId))
  }
})

export const AcceptFriendInvitation = connect(undefined, mapDispatchToProps)(UI.AcceptFriendInvitation)