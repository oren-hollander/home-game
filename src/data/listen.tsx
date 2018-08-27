import * as React from 'react'
import { Component, ComponentType } from 'react'
import { Action } from 'redux'
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { State } from '../state/state'
import { Selector } from 'reselect'

interface CompProps<D> {
  data: D
}

export const listen = <D extends any>(listen: Action<string>, unlisten: Action<string>, selector: Selector<State, D>) => (Comp: ComponentType<CompProps<D>>) => {
  interface ListenStateProps {
    data: D
  }

  interface ListenDispatchProps {
    listen: () => void
    unlisten: () => void
  }

  type ListenProps = ListenStateProps & ListenDispatchProps

  class Listen extends Component<ListenProps> {
    componentDidMount() {
      this.props.listen()
    }

    componentWillUnmount() {
      this.props.unlisten()
    }

    render() {
      return <Comp data={this.props.data} />
    }
  }

  const mapDispatchToProps: MapDispatchToProps<ListenDispatchProps, {}> = dispatch => ({
    listen: () => dispatch(listen),
    unlisten: () => dispatch(unlisten)
  })

  const mapStateToProps: MapStateToProps<ListenStateProps, {}, State> = state => ({
    data: selector(state)
  })

  return connect(mapStateToProps, mapDispatchToProps)(Listen)
}