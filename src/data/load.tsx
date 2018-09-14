import * as React from 'react'
import { Component, ComponentType } from 'react'
import { connect } from 'react-redux'
import { State, HomeGameThunkDispatch, HomeGameAction } from '../app/state'
import { ThunkAction } from 'redux-thunk'
import { Services } from '../services/services'
import { noop, constant, isUndefined, omit } from 'lodash/fp'

type LoadData = (...args: any[]) => ThunkAction<Promise<void>, State, Services, HomeGameAction>
type ClearData = () => ThunkAction<void, State, Services, HomeGameAction>

export const load = <T extends any>(loadData: LoadData, clear: ClearData = constant(noop), propName?: string) => (
  Comp: ComponentType<T>
): ComponentType<T> => {
  interface LoadProps {
    load: () => void
    clear: () => void
  }

  class Load extends Component<LoadProps> {
    componentDidMount() {
      this.props.load()
    }

    componentWillUnmount() {
      this.props.clear()
    }

    render() {
      return <Comp {...omit(['load', 'clear'], this.props)} />
    }
  }

  const mapDispatchToProps = (dispatch: HomeGameThunkDispatch, ownProps: {}): LoadProps => ({
    load: () => dispatch(loadData(isUndefined(propName) ? undefined : ownProps[propName])),
    clear: () => dispatch(clear())
  })

  return (connect(
    undefined,
    mapDispatchToProps
  )(Load) as {}) as ComponentType<T>
}
