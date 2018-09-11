import * as React from 'react'
import { Component, ComponentType } from 'react'
import { connect } from 'react-redux'
import { State, HomeGameThunkDispatch, HomeGameAction } from '../app/state'
import { Unsubscribe } from 'firebase'
import { noop, constant, isUndefined, omit } from 'lodash/fp'
import { ThunkAction } from 'redux-thunk'
import { Services } from '../services/services'

type ListenToData = (...args: any[]) => ThunkAction<Unsubscribe, State, Services, HomeGameAction>
type ClearData = () => ThunkAction<void, State, Services, HomeGameAction>

export const listen = (listen: ListenToData, clear: ClearData = constant(noop), propName?: string) => (Comp: ComponentType) => {
  interface ListenProps {
    listen: () => Unsubscribe
    clear: () => void
  }

  class Listen extends Component<ListenProps> {
    private unsubscribe: Unsubscribe = noop

    componentDidMount() {
      this.unsubscribe = this.props.listen()
    }

    componentWillUnmount() {
      this.unsubscribe()
      this.props.clear()
    }

    render() {
      return <Comp {...omit(['listen', 'clear'], this.props)} />
    }
  }

  const mapDispatchToProps = (dispatch: HomeGameThunkDispatch, ownProps: {}): ListenProps => ({
    listen: () => dispatch(listen(isUndefined(propName) ? undefined : ownProps[propName])),
    clear: () => dispatch(clear())
  })

  return connect(undefined, mapDispatchToProps)(Listen)
}