import * as React from 'react'
import { connect } from 'react-redux'
import { State } from '../state'
import { SFC } from 'react'
import { getUser } from '../auth/authReducer'

interface InviteFriendProps {
  userId: string
}

namespace UI {
  export const InviteFriend: SFC<InviteFriendProps> = ({ userId }) =>
    <div>
      Send this link to your friend:
    <pre>https://homegame.app/addFriend/{userId}</pre>
    </div>
}

const mapStateToProps = (state: State): InviteFriendProps => ({
  userId: getUser(state).userId
})

export const InviteFriend = connect(mapStateToProps)(UI.InviteFriend)