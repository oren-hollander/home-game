import * as React from 'react'
import { Component, ComponentType } from 'react'
import { connect } from 'react-redux'
import { State, HomeGameThunkDispatch, HomeGameAction } from '../app/state'
import { Unsubscribe } from 'firebase'
import { noop } from 'lodash/fp'
import { ThunkAction } from 'redux-thunk'
import { Services } from '../services/services'

type ListenToData = () => ThunkAction<Unsubscribe, State, Services, HomeGameAction>

export const listen = (listen: ListenToData) => (Comp: ComponentType) => {
  interface ListenProps {
    listen: () => Unsubscribe
  }

  class Listen extends Component<ListenProps> {
    private unsubscribe: Unsubscribe = noop

    componentDidMount() {
      this.unsubscribe = this.props.listen()
    }

    componentWillUnmount() {
      this.unsubscribe()
    }

    render() {
      return <Comp />
    }
  }

  const mapDispatchToProps = (dispatch: HomeGameThunkDispatch): ListenProps => ({
    listen: () => dispatch(listen())
  })

  return connect(undefined, mapDispatchToProps)(Listen)
}