import * as React from 'react'
import { Component } from 'react'
import { Redirect, RouteComponentProps } from 'react-router-dom'
import { connect } from 'react-redux'
import { acceptFriendInvitation } from './friendsActions'
import { HomeGameThunkDispatch } from '../state';
import { parse } from 'query-string'

interface AddFriendProps  {
  acceptFriendInvitation: (playerId: string, invitationId: string) => void
}

namespace UI {
  interface AddFriendState {
    loaded: boolean
  }

  export class AddFriend extends Component<RouteComponentProps<{}> & AddFriendProps, AddFriendState> {
    state: AddFriendState = { loaded: false }

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

const mapDispatchToProps = (dispatch: HomeGameThunkDispatch): AddFriendProps => ({
  acceptFriendInvitation: (playerId: string, invitationId: string) => {
    dispatch(acceptFriendInvitation(playerId, invitationId))
  }
})

export const AddFriend = connect(undefined, mapDispatchToProps)(UI.AddFriend)