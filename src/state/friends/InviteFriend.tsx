import * as React from 'react'
import {connect} from 'react-redux'
import {State} from '../state'
import {SFC} from 'react'
import {getUserId} from '../auth/authReducer'


interface InviteFriendProps {
  userId: string
}

export const InviteFriendComponent: SFC<InviteFriendProps> = ({userId}) =>
  <div>
    Send this link to your friend:
    <pre>https://homegame.app/addFriend/{userId}</pre>
  </div>

const mapStateToProps = (state: State): InviteFriendProps => ({
  userId: getUserId(state)!
})

export const InviteFriend = connect(mapStateToProps)(InviteFriendComponent)