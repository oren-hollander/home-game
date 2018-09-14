import * as React from 'react'
import { Component } from 'react'
import { connect } from 'react-redux'
import { State, HomeGameThunkDispatch } from '../state'
import { getUser } from '../auth/authReducer'
import { createFriendInvitation } from './friendsActions'
import { isEmpty } from 'lodash/fp'
import { copyToClipboard } from '../clipboard/clipboardActions'
import { Page } from '../../ui/Page'
import { Button, Jumbotron } from 'reactstrap'

interface InviteFriendStateProps {
  userId: string
}

interface InviteFriendDispatchProps {
  createFriendInvitation: () => Promise<string>
  copy: (text: string) => void
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

    invitationUrl = () =>
      `https://homegame.app/friends/accept?userId=${this.props.userId}&invitationId=${this.state.invitationId}`

    copyToClipboard = () => {
      this.props.copy(this.invitationUrl())
    }

    render() {
      return (
        <Page>
          <Jumbotron>
            {isEmpty(this.state.invitationId) ? (
              <>
                <p>Invite a friend.</p>
                <p>By clicking 'Create', you will get an invitation link.</p>
                <Button color="primary" onClick={this.createFriendInvitation}>
                  Create Invitation
                </Button>
              </>
            ) : (
              <>
                <p>Send this invitation link to your friend:</p>
                <pre>{this.invitationUrl()}</pre>
                <Button color="primary" onClick={this.copyToClipboard}>
                  Copy
                </Button>
              </>
            )}
          </Jumbotron>
        </Page>
      )
    }
  }
}

const mapStateToProps = (state: State): InviteFriendStateProps => ({
  userId: getUser(state).userId
})

const mapDispatchToProps = (dispatch: HomeGameThunkDispatch): InviteFriendDispatchProps => ({
  createFriendInvitation() {
    return dispatch(createFriendInvitation())
  },
  copy(text: string) {
    dispatch(copyToClipboard(text))
  }
})

export const InviteFriend = connect(
  mapStateToProps,
  mapDispatchToProps
)(UI.InviteFriend)
