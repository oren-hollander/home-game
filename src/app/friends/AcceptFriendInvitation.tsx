import * as React from 'react'
import { Component } from 'react'
import { Redirect, RouteComponentProps } from 'react-router-dom'
import { connect } from 'react-redux'
import { acceptFriendInvitation } from './friendsActions'
import { HomeGameThunkDispatch } from '../state';
import { parse } from 'query-string'

interface AcceptFriendInvitationProps  {
  acceptFriendInvitation: (playerId: string, invitationId: string) => void
}

namespace UI {
  interface AcceptFriendInvitationState {
    loaded: boolean
  }

  export class AcceptFriendInvitation extends Component<RouteComponentProps<{}> & AcceptFriendInvitationProps, AcceptFriendInvitationState> {
    state: AcceptFriendInvitationState = { loaded: false }

    async componentDidMount() {
      const { userId, invitationId } = parse(this.props.location.search)
      await this.props.acceptFriendInvitation(userId, invitationId)
      this.setState({ loaded: true })
    }

    render() {
      return this.state.loaded 
        ? <> Connecting friends... </>
        : <Redirect to='/' />
    }
  }
}

const mapDispatchToProps = (dispatch: HomeGameThunkDispatch): AcceptFriendInvitationProps => ({
  acceptFriendInvitation: (playerId: string, invitationId: string) => {
    dispatch(acceptFriendInvitation(playerId, invitationId))
  }
})

export const AcceptFriendInvitation = connect(undefined, mapDispatchToProps)(UI.AcceptFriendInvitation)