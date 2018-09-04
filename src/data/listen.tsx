import * as React from 'react'
import { Component, ComponentType } from 'react'
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { State, HomeGameThunkAction, HomeGameThunkDispatch } from '../app/state'
import { Selector } from 'reselect'
import { Unsubscribe } from 'firebase';
import { noop } from 'lodash/fp'

interface CompProps<D> {
  data: D
}

type ListenToData = () => HomeGameThunkAction<Unsubscribe>

export const listen = <D extends any>(listen: ListenToData, selector: Selector<State, D>) => (Comp: ComponentType<CompProps<D>>) => {
  interface ListenStateProps {
    data: D
  }

  interface ListenDispatchProps {
    listen: () => Unsubscribe
  }

  type ListenProps = ListenStateProps & ListenDispatchProps

  class Listen extends Component<ListenProps> {
    unsubscribe: Unsubscribe = noop

    componentDidMount() {
      this.unsubscribe = this.props.listen()
    }

    componentWillUnmount() {
      this.unsubscribe()
    }

    render() {
      return <Comp data={this.props.data} />
    }
  }

  const mapDispatchToProps: MapDispatchToProps<ListenDispatchProps, {}> = (dispatch: HomeGameThunkDispatch): ListenDispatchProps => ({
    listen: () => dispatch(listen())
  })

  const mapStateToProps: MapStateToProps<ListenStateProps, {}, State> = state => ({
    data: selector(state)
  })

  return connect(mapStateToProps, mapDispatchToProps)(Listen)
}