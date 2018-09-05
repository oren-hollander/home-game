import * as React from 'react'
import { Component } from 'react'
import { connect } from 'react-redux'
import { State, HomeGameThunkDispatch } from '../state'
import { getUser } from '../auth/authReducer'
import { createFriendInvitation } from './friendsActions'
import { isEmpty } from 'lodash/fp'

interface InviteFriendStateProps {
  userId: string
}

interface InviteFriendDispatchProps {
  createFriendInvitation: () => Promise<string>
}

type InviteFriendProps = InviteFriendStateProps & InviteFriendDispatchProps

namespace UI {
  interface InviteFriendState {
    invitationId: string
  }

  export class InviteFriend extends Component<InviteFriendProps, InviteFriendState> {
    state: InviteFriendState = {
      invitationId: ''
    }

    createFriendInvitation = async () => {
      const invitationId = await this.props.createFriendInvitation()
      this.setState({ invitationId })
    }

    render() {
      return (
        <div>
          { 
            isEmpty(this.state.invitationId) 
              ? <button onClick={this.createFriendInvitation}>Create Invitation</button>
              : <>
                  Send this link to your friend:
                  <pre>https://homegame.app/addFriend?userId={this.props.userId}&invitationId={this.state.invitationId}</pre>
                </>
          }
        </div>
      )
    }
  }
}

const mapStateToProps = (state: State): InviteFriendStateProps => ({
  userId: getUser(state).userId
})

const mapDispatchToProps = (dispatch: HomeGameThunkDispatch): InviteFriendDispatchProps => ({
  createFriendInvitation: () => dispatch(createFriendInvitation())
})

export const InviteFriend = connect(mapStateToProps, mapDispatchToProps)(UI.InviteFriend)