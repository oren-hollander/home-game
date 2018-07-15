import * as React from 'react'
import {Component} from 'react'
import {Redirect, RouteComponentProps} from 'react-router-dom'
import {connect} from 'react-redux'
import {Dispatch} from 'redux'
import {addFriend} from './friendsActions'

interface AddFriendProps  {
  addFriend: (playerId: string) => void
}

export class AddFriendComponent extends Component<RouteComponentProps<{playerId: string}> & AddFriendProps, {loaded: boolean}> {

  state = {loaded: false}

  componentDidMount() {
    this.props.addFriend(this.props.match.params.playerId)
    this.setState({loaded: true})
  }

  render() {
    return this.state.loaded ? null : <Redirect to='/'/>
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  addFriend: (playerId: string) => {
    dispatch(addFriend(playerId))
  }
})

export const AddFriend = connect(undefined, mapDispatchToProps)(AddFriendComponent)